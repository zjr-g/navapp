from pydantic import BaseModel
from datetime import datetime
from typing import Optional


class UserCreate(BaseModel):
    username: str
    password: str


class UserResponse(BaseModel):
    id: int
    username: str
    created_at: datetime

    class Config:
        from_attributes = True


class Token(BaseModel):
    access_token: str
    token_type: str


class CategoryBase(BaseModel):
    name: str
    sort_order: int = 0


class CategoryCreate(CategoryBase):
    pass


class CategoryUpdate(BaseModel):
    name: Optional[str] = None
    sort_order: Optional[int] = None


class CategoryResponse(CategoryBase):
    id: int
    user_id: int
    created_at: datetime

    class Config:
        from_attributes = True


class LinkBase(BaseModel):
    title: str
    url: str
    icon: str = "🔗"
    icon_local: Optional[str] = None
    sort_order: int = 0


class LinkCreate(LinkBase):
    category_id: int


class LinkUpdate(BaseModel):
    title: Optional[str] = None
    url: Optional[str] = None
    icon: Optional[str] = None
    icon_local: Optional[str] = None
    category_id: Optional[int] = None
    sort_order: Optional[int] = None


class LinkResponse(LinkBase):
    id: int
    user_id: int
    category_id: int
    icon_local: Optional[str] = None
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class CategoryWithLinks(CategoryResponse):
    links: list[LinkResponse] = []

    class Config:
        from_attributes = True


class SearchEngineBase(BaseModel):
    name: str
    url: str
    sort_order: int = 0
    is_default: bool = False


class SearchEngineCreate(SearchEngineBase):
    pass


class SearchEngineUpdate(BaseModel):
    name: Optional[str] = None
    url: Optional[str] = None
    sort_order: Optional[int] = None
    is_default: Optional[bool] = None


class SearchEngineResponse(SearchEngineBase):
    id: int
    user_id: int
    created_at: datetime

    class Config:
        from_attributes = True


class CategoryReorderItem(BaseModel):
    id: int
    sort_order: int


class CategoryReorder(BaseModel):
    categories: list[CategoryReorderItem]
