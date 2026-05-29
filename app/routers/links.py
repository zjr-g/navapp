from typing import List, Optional
from urllib.parse import urlparse
import hashlib
import json
import os
import httpx
from fastapi import APIRouter, Depends, HTTPException, Request
from pydantic import BaseModel
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import User, Link, Category
from app.schemas import LinkCreate, LinkUpdate, LinkResponse
from app.auth import get_current_user

router = APIRouter(prefix="/api/links", tags=["links"])

FAVICONS_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))), "static", "favicons")

FORMAT_EXTENSIONS = {
    'image/x-icon': '.ico',
    'image/vnd.microsoft.icon': '.ico',
    'image/png': '.png',
    'image/jpeg': '.jpg',
    'image/webp': '.webp',
    'image/svg+xml': '.svg',
}

MAGIC_BYTES = [
    (b'\x89PNG\r\n\x1a\n', '.png'),
    (b'GIF87a', '.gif'),
    (b'GIF89a', '.gif'),
    (b'\xff\xd8\xff', '.jpg'),
    (b'RIFF', '.webp'),
    (b'\x00\x00\x01\x00', '.ico'),
    (b'<svg', '.svg'),
    (b'<?xml', '.svg'),
]


def _detect_format(content: bytes, content_type: str = "") -> str:
    if content_type:
        ct_lower = content_type.lower().split(';')[0].strip()
        if ct_lower in FORMAT_EXTENSIONS:
            return FORMAT_EXTENSIONS[ct_lower]
    for magic, ext in MAGIC_BYTES:
        if content[:len(magic)] == magic:
            return ext
    if b'<svg' in content[:500]:
        return '.svg'
    return '.png'


def _favicon_filename(domain: str, ext: str = ".png") -> str:
    return hashlib.md5(domain.encode()).hexdigest() + ext


def _find_cached(domain: str):
    base = hashlib.md5(domain.encode()).hexdigest()
    for ext in ['.ico', '.png', '.svg', '.jpg', '.webp', '.gif']:
        filename = base + ext
        filepath = os.path.join(FAVICONS_DIR, filename)
        if os.path.exists(filepath):
            return filename, filepath
    return None, None


class IconUrlRequest(BaseModel):
    url: str


def _to_online_icon(link_url: str, icon: str) -> str:
    if icon and not icon.startswith("/"):
        return icon
    domain = _extract_domain(link_url)
    return f"https://favicon.im/{domain}" if domain else icon


@router.post("/fetch-icon")
async def fetch_icon(request: IconUrlRequest, current_user: User = Depends(get_current_user)):
    try:
        parsed = urlparse(request.url)
        domain = parsed.hostname or parsed.path.split("/")[0]
        if not domain:
            return {"icon_local": None, "icon_url": None}
    except Exception:
        return {"icon_local": None, "icon_url": None}

    cached_name, cached_path = _find_cached(domain)
    if cached_name:
        return {"icon_local": f"/static/favicons/{cached_name}", "icon_url": f"https://favicon.im/{domain}"}

    favicon_url = f"https://favicon.im/{domain}"
    try:
        async with httpx.AsyncClient(timeout=10, follow_redirects=True) as client:
            resp = await client.get(favicon_url)
            if resp.status_code == 200 and resp.content:
                content_type = resp.headers.get("content-type", "")
                ext = _detect_format(resp.content, content_type)
                filename = _favicon_filename(domain, ext)
                filepath = os.path.join(FAVICONS_DIR, filename)
                if not os.path.exists(FAVICONS_DIR):
                    os.makedirs(FAVICONS_DIR, exist_ok=True)
                with open(filepath, "wb") as f:
                    f.write(resp.content)
                return {"icon_local": f"/static/favicons/{filename}", "icon_url": favicon_url}
    except Exception:
        pass

    return {"icon_local": None, "icon_url": f"https://favicon.im/{domain}"}


def _extract_domain(url_str):
    if not url_str:
        return None
    try:
        parsed = urlparse(url_str)
        domain = parsed.hostname
        if domain:
            return domain
        path = parsed.path.split("/")[0] if parsed.path else ""
        return path if path else None
    except Exception:
        return None


async def _download_favicon(domain):
    cached_name, cached_path = _find_cached(domain)
    if cached_name:
        return f"/static/favicons/{cached_name}"

    favicon_url = f"https://favicon.im/{domain}"
    try:
        async with httpx.AsyncClient(timeout=10, follow_redirects=True) as client:
            resp = await client.get(favicon_url)
            if resp.status_code == 200 and resp.content:
                content_type = resp.headers.get("content-type", "")
                ext = _detect_format(resp.content, content_type)
                filename = _favicon_filename(domain, ext)
                filepath = os.path.join(FAVICONS_DIR, filename)
                if not os.path.exists(FAVICONS_DIR):
                    os.makedirs(FAVICONS_DIR, exist_ok=True)
                with open(filepath, "wb") as f:
                    f.write(resp.content)
                return f"/static/favicons/{filename}"
    except Exception:
        pass
    return None


@router.post("/sync-icons")
async def sync_icons(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    links = db.query(Link).filter(
        Link.user_id == current_user.id,
        Link.icon_local.is_(None)
    ).all()

    synced = 0
    failed = 0
    skipped = 0

    for link in links:
        url_to_parse = link.url if link.url else link.icon
        if not url_to_parse:
            skipped += 1
            continue
        domain = _extract_domain(url_to_parse)
        if not domain:
            skipped += 1
            continue

        local_path = await _download_favicon(domain)
        if local_path:
            link.icon_local = local_path
            if link.icon and link.icon.startswith("http"):
                link.icon = local_path
            synced += 1
        else:
            failed += 1

    db.commit()

    return {"synced": synced, "failed": failed, "skipped": skipped, "total": len(links)}


@router.post("/fix-icons")
def fix_icons(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    if not os.path.exists(FAVICONS_DIR):
        return {"renamed": 0, "db_updated": 0, "errors": 0}

    renamed = 0
    db_updated = 0
    errors = 0

    for filename in os.listdir(FAVICONS_DIR):
        if not filename.endswith('.png'):
            continue
        filepath = os.path.join(FAVICONS_DIR, filename)
        if not os.path.isfile(filepath):
            continue

        with open(filepath, 'rb') as f:
            content = f.read()

        real_ext = _detect_format(content, "")
        if real_ext == '.png':
            continue

        base_name = filename[:-4]
        new_filename = base_name + real_ext
        new_filepath = os.path.join(FAVICONS_DIR, new_filename)

        old_path = f"/static/favicons/{filename}"
        new_path = f"/static/favicons/{new_filename}"

        try:
            os.rename(filepath, new_filepath)
            renamed += 1
        except Exception:
            errors += 1
            continue

        links = db.query(Link).filter(
            (Link.icon == old_path) | (Link.icon_local == old_path)
        ).all()
        for link in links:
            if link.icon == old_path:
                link.icon = new_path
            if link.icon_local == old_path:
                link.icon_local = new_path
            db_updated += 1

    if db_updated > 0:
        db.commit()

    return {"renamed": renamed, "db_updated": db_updated, "errors": errors}


@router.get("", response_model=List[LinkResponse])
def get_links(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    links = db.query(Link).filter(Link.user_id == current_user.id).order_by(Link.sort_order).all()
    return links


@router.get("/export")
def export_links(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    categories = db.query(Category).filter(Category.user_id == current_user.id).order_by(Category.sort_order).all()
    result = []
    for cat in categories:
        links = db.query(Link).filter(Link.category_id == cat.id, Link.user_id == current_user.id).order_by(Link.sort_order).all()
        result.append({
            "category": {"name": cat.name, "sort_order": cat.sort_order},
            "links": [{
                "title": l.title,
                "url": l.url,
                "icon": _to_online_icon(l.url, l.icon),
                "sort_order": l.sort_order
            } for l in links]
        })
    return result


@router.post("/import-data")
async def import_links(request: Request, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    try:
        body = await request.json()
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid JSON")

    if not isinstance(body, list):
        raise HTTPException(status_code=400, detail="Expected a list of categories")

    imported_categories = 0
    imported_links = 0

    for item in body:
        cat_data = item.get("category", {})
        cat_name = cat_data.get("name", "Imported")
        cat_sort = cat_data.get("sort_order", 0)

        existing_cat = db.query(Category).filter(Category.user_id == current_user.id, Category.name == cat_name).first()
        if existing_cat:
            category = existing_cat
        else:
            category = Category(user_id=current_user.id, name=cat_name, sort_order=cat_sort)
            db.add(category)
            db.flush()
            imported_categories += 1

        for link_data in item.get("links", []):
            existing_link = db.query(Link).filter(Link.user_id == current_user.id, Link.url == link_data.get("url", ""), Link.category_id == category.id).first()
            if existing_link:
                continue
            link = Link(
                user_id=current_user.id,
                category_id=category.id,
                title=link_data.get("title", "Untitled"),
                url=link_data.get("url", ""),
                icon=link_data.get("icon", "🔗"),
                sort_order=link_data.get("sort_order", 0)
            )
            db.add(link)
            imported_links += 1

    db.commit()

    for item in body:
        for link_data in item.get("links", []):
            url = link_data.get("url", "")
            domain = _extract_domain(url)
            if domain:
                await _download_favicon(domain)

    return {"imported_categories": imported_categories, "imported_links": imported_links}


@router.post("", response_model=LinkResponse)
def create_link(link: LinkCreate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    category = db.query(Category).filter(Category.id == link.category_id, Category.user_id == current_user.id).first()
    if not category:
        raise HTTPException(status_code=404, detail="Category not found")
    new_link = Link(
        user_id=current_user.id,
        category_id=link.category_id,
        title=link.title,
        url=link.url,
        icon=link.icon,
        icon_local=link.icon_local,
        sort_order=link.sort_order
    )
    db.add(new_link)
    db.commit()
    db.refresh(new_link)
    return new_link


@router.put("/{link_id}", response_model=LinkResponse)
def update_link(link_id: int, link: LinkUpdate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    db_link = db.query(Link).filter(Link.id == link_id, Link.user_id == current_user.id).first()
    if not db_link:
        raise HTTPException(status_code=404, detail="Link not found")
    if link.title is not None:
        db_link.title = link.title
    if link.url is not None:
        db_link.url = link.url
    if link.icon is not None:
        db_link.icon = link.icon
    if getattr(link, 'icon_local', None) is not None:
        db_link.icon_local = link.icon_local
    if link.category_id is not None:
        category = db.query(Category).filter(Category.id == link.category_id, Category.user_id == current_user.id).first()
        if not category:
            raise HTTPException(status_code=404, detail="Category not found")
        db_link.category_id = link.category_id
    if link.sort_order is not None:
        db_link.sort_order = link.sort_order
    db.commit()
    db.refresh(db_link)
    return db_link


@router.delete("/{link_id}")
def delete_link(link_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    db_link = db.query(Link).filter(Link.id == link_id, Link.user_id == current_user.id).first()
    if not db_link:
        raise HTTPException(status_code=404, detail="Link not found")
    db.delete(db_link)
    db.commit()
    return {"message": "Link deleted"}


@router.post("/check-health")
async def check_health(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    links = db.query(Link).filter(Link.user_id == current_user.id).all()
    results = []

    async with httpx.AsyncClient(timeout=8, follow_redirects=True) as client:
        for link in links:
            try:
                resp = await client.head(link.url)
                status_code = resp.status_code
                ok = 200 <= status_code < 500
            except Exception:
                status_code = 0
                ok = False
            results.append({
                "id": link.id,
                "url": link.url,
                "title": link.title,
                "ok": ok,
                "status_code": status_code
            })

    return {"results": results}
