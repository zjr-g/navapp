from fastapi import FastAPI, Request
from fastapi.responses import HTMLResponse, FileResponse
from fastapi.staticfiles import StaticFiles
from fastapi.templating import Jinja2Templates
from app.database import engine, Base
from app.routers import auth, categories, links, engines
import os
import mimetypes

mimetypes.add_type('image/webp', '.webp')

Base.metadata.create_all(bind=engine)

FAVICONS_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "static", "favicons")
os.makedirs(FAVICONS_DIR, exist_ok=True)

app = FastAPI(title="NavApp", description="Personal navigation web app")

app.include_router(auth.router)
app.include_router(categories.router)
app.include_router(links.router)
app.include_router(engines.router)

app.mount("/static", StaticFiles(directory="static"), name="static")
templates = Jinja2Templates(directory="templates")

# 工具模块路由
TOOLS_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "templates", "tools")

@app.get("/templates/tools/{filename}")
async def get_tool_module(filename: str):
    filepath = os.path.join(TOOLS_DIR, filename)
    if os.path.exists(filepath):
        return FileResponse(filepath, media_type="application/javascript")
    return {"error": "File not found"}, 404


@app.get("/", response_class=HTMLResponse)
def home(request: Request):
    return templates.TemplateResponse("login.html", {"request": request})


@app.get("/login", response_class=HTMLResponse)
def login(request: Request):
    return templates.TemplateResponse("login.html", {"request": request})


@app.get("/register", response_class=HTMLResponse)
def register(request: Request):
    return templates.TemplateResponse("register.html", {"request": request})


@app.get("/dashboard", response_class=HTMLResponse)
def dashboard(request: Request):
    return templates.TemplateResponse("dashboard.html", {"request": request})


@app.get("/tools", response_class=HTMLResponse)
def tools(request: Request):
    return templates.TemplateResponse("tools.html", {"request": request})


@app.get("/api/health")
def health_check():
    return {"status": "healthy", "service": "navapp"}


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
