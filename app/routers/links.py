from typing import List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import User, Link, Category
from app.schemas import LinkCreate, LinkUpdate, LinkResponse
from app.auth import get_current_user

router = APIRouter(prefix="/api/links", tags=["links"])


@router.get("", response_model=List[LinkResponse])
def get_links(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    links = db.query(Link).filter(Link.user_id == current_user.id).order_by(Link.sort_order).all()
    return links


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
