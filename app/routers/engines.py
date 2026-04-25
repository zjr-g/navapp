from typing import List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import User, SearchEngine
from app.schemas import SearchEngineCreate, SearchEngineUpdate, SearchEngineResponse
from app.auth import get_current_user

router = APIRouter(prefix="/api/engines", tags=["engines"])


@router.get("", response_model=List[SearchEngineResponse])
def get_engines(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    engines = db.query(SearchEngine).filter(SearchEngine.user_id == current_user.id).order_by(SearchEngine.sort_order).all()
    return engines


@router.post("", response_model=SearchEngineResponse)
def create_engine(engine: SearchEngineCreate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    if engine.is_default:
        db.query(SearchEngine).filter(SearchEngine.user_id == current_user.id, SearchEngine.is_default == True).update({"is_default": False})
    new_engine = SearchEngine(
        user_id=current_user.id,
        name=engine.name,
        url=engine.url,
        sort_order=engine.sort_order,
        is_default=engine.is_default
    )
    db.add(new_engine)
    db.commit()
    db.refresh(new_engine)
    return new_engine


@router.put("/{engine_id}", response_model=SearchEngineResponse)
def update_engine(engine_id: int, engine: SearchEngineUpdate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    db_engine = db.query(SearchEngine).filter(SearchEngine.id == engine_id, SearchEngine.user_id == current_user.id).first()
    if not db_engine:
        raise HTTPException(status_code=404, detail="Engine not found")
    if engine.is_default and not db_engine.is_default:
        db.query(SearchEngine).filter(SearchEngine.user_id == current_user.id, SearchEngine.is_default == True).update({"is_default": False})
    if engine.name is not None:
        db_engine.name = engine.name
    if engine.url is not None:
        db_engine.url = engine.url
    if engine.sort_order is not None:
        db_engine.sort_order = engine.sort_order
    if engine.is_default is not None:
        db_engine.is_default = engine.is_default
    db.commit()
    db.refresh(db_engine)
    return db_engine


@router.delete("/{engine_id}")
def delete_engine(engine_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    db_engine = db.query(SearchEngine).filter(SearchEngine.id == engine_id, SearchEngine.user_id == current_user.id).first()
    if not db_engine:
        raise HTTPException(status_code=404, detail="Engine not found")
    db.delete(db_engine)
    db.commit()
    return {"message": "Engine deleted"}


@router.post("/init-default")
def init_default_engines(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    existing = db.query(SearchEngine).filter(SearchEngine.user_id == current_user.id).first()
    if existing:
        return {"message": "Engines already exist"}
    
    default_engines = [
        SearchEngine(user_id=current_user.id, name="Google", url="https://www.google.com/search?q={q}", sort_order=0, is_default=True),
        SearchEngine(user_id=current_user.id, name="百度", url="https://www.baidu.com/s?wd={q}", sort_order=1, is_default=False),
        SearchEngine(user_id=current_user.id, name="Bing", url="https://www.bing.com/search?q={q}", sort_order=2, is_default=False),
    ]
    db.add_all(default_engines)
    db.commit()
    return {"message": "Default engines created"}
