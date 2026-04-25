from typing import List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import User, Category
from app.schemas import CategoryCreate, CategoryUpdate, CategoryResponse, CategoryWithLinks
from app.auth import get_current_user

router = APIRouter(prefix="/api/categories", tags=["categories"])


@router.get("", response_model=List[CategoryWithLinks])
def get_categories(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    categories = db.query(Category).filter(Category.user_id == current_user.id).order_by(Category.sort_order).all()
    return categories


@router.post("", response_model=CategoryResponse)
def create_category(category: CategoryCreate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    new_category = Category(user_id=current_user.id, name=category.name, sort_order=category.sort_order)
    db.add(new_category)
    db.commit()
    db.refresh(new_category)
    return new_category


@router.put("/{category_id}", response_model=CategoryResponse)
def update_category(category_id: int, category: CategoryUpdate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    db_category = db.query(Category).filter(Category.id == category_id, Category.user_id == current_user.id).first()
    if not db_category:
        raise HTTPException(status_code=404, detail="Category not found")
    if category.name is not None:
        db_category.name = category.name
    if category.sort_order is not None:
        db_category.sort_order = category.sort_order
    db.commit()
    db.refresh(db_category)
    return db_category


@router.delete("/{category_id}")
def delete_category(category_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    db_category = db.query(Category).filter(Category.id == category_id, Category.user_id == current_user.id).first()
    if not db_category:
        raise HTTPException(status_code=404, detail="Category not found")
    db.delete(db_category)
    db.commit()
    return {"message": "Category deleted"}
