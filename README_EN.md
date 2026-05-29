<div align="right">
  <a href="README.md">🇨🇳 中文</a>
</div>

# NavApp - Personal Navigation Website

A modern personal navigation website built with **FastAPI + SQLite**, featuring user authentication, bookmark management, and an online IT toolbox.

![FastAPI](https://img.shields.io/badge/FastAPI-0.109.0-green)
![Python](https://img.shields.io/badge/Python-3.8+-blue)
![SQLite](https://img.shields.io/badge/SQLite-3.x-blue)
![License](https://img.shields.io/badge/License-MIT-yellow)

## ✨ Features

### 🏠 Core
- **User System** - Register/Login, JWT auth, bcrypt password hashing
- **Categories** - Custom link groups with sorting
- **Bookmarks** - Add/Edit/Delete links, custom icons, local favicon cache, health check
- **Search Engines** - Multi-engine switching, custom engines
- **Import/Export** - JSON and HTML bookmark format support
- **Dark Mode** - One-click toggle, persisted to localStorage
- **Responsive** - Desktop and mobile friendly

### 🛠️ Online Toolbox (10+ Tools)
- **Hash Calculator** - MD5, SHA1, SHA224, SHA256, SHA384, SHA512, SHA3
- **Base Converter** - Binary, Octal, Decimal, Hexadecimal
- **Encode/Decode** - URL, Base64, HTML entities, Unicode, ASCII
- **Text Stats** - Character, word, line count, byte size
- **Text Diff** - Line/char comparison, diff highlight, export report
- **Chmod Calculator** - Linux permission calculator
- **QR Code Generator** - Custom color, size, error correction
- **JSON Formatter** - JSON validation and formatting
- **AES Encrypt/Decrypt** - AES-256 encryption and decryption

### 🔒 Security
- bcrypt password hashing
- JWT Token auth (7-day expiry)
- Auto token expiry check on frontend
- Per-user data isolation
- XSS protection (HTML escaping)

## 📁 Project Structure

```
navapp/
├── app/
│   ├── __init__.py
│   ├── main.py              # FastAPI entry point
│   ├── models.py            # SQLAlchemy models
│   ├── schemas.py           # Pydantic schemas
│   ├── auth.py              # JWT auth & password
│   ├── database.py          # Database config
│   └── routers/
│       ├── auth.py          # Auth routes
│       ├── categories.py    # Category routes
│       ├── links.py         # Link routes
│       └── engines.py       # Search engine routes
├── templates/
│   ├── login.html           # Login page
│   ├── register.html        # Register page
│   ├── dashboard.html       # Main dashboard
│   ├── tools.html           # IT tools page
│   └── tools/               # Tool modules
│       ├── tools-core.js    # Registry + utilities
│       ├── hash-tool.js     # Hash calculator
│       ├── base-tool.js     # Base converter
│       ├── encode-tool.js   # Encode/Decode
│       ├── textstats-tool.js # Text statistics
│       ├── textdiff-tool.js  # Text diff
│       ├── chmod-tool.js    # Chmod calculator
│       ├── qrcode-tool.js   # QR code generator
│       ├── json-tool.js     # JSON formatter
│       └── aes-tool.js      # AES encrypt/decrypt
├── static/
│   ├── favicon.png          # Site favicon
│   ├── crypto-js.min.js     # CryptoJS library
│   └── qrcode.min.js        # QR code library
├── requirements.txt         # Python dependencies
└── README.md               # Documentation
```

## 🚀 Quick Start

### Prerequisites
- Python 3.8+
- pip

### Option 1: Direct

#### Install Dependencies

```bash
cd navapp
pip install -r requirements.txt
```

#### Start Server

**Development (hot reload):**
```bash
python -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

**Production:**
```bash
python -m uvicorn app.main:app --host 0.0.0.0 --port 8000 --workers 4
```

### Option 2: Docker

#### Using Docker Compose (Recommended)

```bash
# Start
docker-compose up -d

# Logs
docker-compose logs -f

# Stop
docker-compose down
```

#### Using Docker

```bash
docker build -t navapp .
docker run -d -p 8000:8000 -v $(pwd)/navapp.db:/app/navapp.db --name navapp navapp
```

### Access

Open http://localhost:8000 in your browser.

1. Click "Register" to create an account
2. Log in to access the dashboard
3. Add categories and bookmarks
4. Visit `/tools` for the IT toolbox

## 📊 API Endpoints

### Auth
| Method | Path | Description |
|--------|------|-------------|
| POST | `/api/auth/register` | Register user |
| POST | `/api/auth/login` | Login user |
| GET | `/api/auth/me` | Get current user |

### Categories
| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/categories` | List categories |
| POST | `/api/categories` | Create category |
| PUT | `/api/categories/{id}` | Update category |
| DELETE | `/api/categories/{id}` | Delete category |

### Links
| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/links` | List links |
| POST | `/api/links` | Create link |
| PUT | `/api/links/{id}` | Update link |
| DELETE | `/api/links/{id}` | Delete link |

### Search Engines
| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/engines` | List engines |
| POST | `/api/engines` | Create engine |
| PUT | `/api/engines/{id}` | Update engine |
| DELETE | `/api/engines/{id}` | Delete engine |
| POST | `/api/engines/init-default` | Init default engines |

## 🛠️ Tech Stack

### Backend
- **FastAPI** - High-performance web framework
- **SQLAlchemy** - ORM framework
- **SQLite** - Lightweight database
- **Pydantic** - Data validation
- **bcrypt** - Password hashing
- **python-jose** - JWT auth
- **Jinja2** - Template engine

### Frontend
- **Vanilla JavaScript** - No framework
- **Modular Design** - Separated tool modules
- **Lazy Loading** - On-demand tool loading
- **CryptoJS** - Frontend encryption
- **QRCode.js** - QR code generation

## 🔧 Configuration

### Database
Database file is created at project root: `navapp.db`

### Environment Variables (Optional)
```bash
export SECRET_KEY="your-secret-key-here"
```

### Connection Pool
```python
engine = create_engine(
    SQLALCHEMY_DATABASE_URL,
    pool_size=10,
    max_overflow=20,
    pool_pre_ping=True,
    pool_recycle=3600
)
```

## 📝 Development Guide

### Adding a New Tool

1. Create a tool file in `templates/tools/`:
```javascript
(function() {
    const tool = {
        id: 'mytool',
        name: 'My Tool',
        icon: '🔧',
        render(container) {
            container.innerHTML = `<div class="tool-container">...</div>`;
        },
        init(container) {
            // initialization
        }
    };
    ToolsRegistry.register(tool);
})();
```

2. Register it in `tools-core.js`:
```javascript
standaloneTools: [
    { id: 'mytool', name: 'My Tool', icon: '🔧' }
]
```

### Adding a New API Route

1. Create a route file in `app/routers/`
2. Register it in `app/main.py`

## 🐛 Known Issues

None at this time.

## 📄 Changelog

### v2.4 (2026-05-08) - Latest
- ✨ Dark mode (all pages, CSS variables, localStorage)
- ✨ Link search/filter (cross-category title & URL search)
- ✨ Import/Export bookmarks (JSON & HTML format)
- ✨ Link health check (detect and mark broken links)
- ✨ Favicon local cache (fix 60% icons not displaying)

### v2.3 (2026-05-06)
- 🔒 Frontend token expiry check
- 🔧 Text diff tool memory limit (MAX_COMPARE_LINES)
- 💾 Database connection pool optimization
- 🐛 Fix tool module loading retry
- 🐛 Fix XSS risk (HTML escaping)

### v2.2 (2026-04-26)
- ✨ Tool modular refactor (10 independent files)
- ✨ Text diff, Chmod, QR code tools
- ✨ Encode/Decode, Text stats tools
- 🔒 Frontend token expiry check, JWT auth
- 🐛 Fix XSS risk
- ⚡ Lazy loading + retry mechanism
- 💾 Connection pool optimization

### v2.0 (2026-03-xx)
- ✨ Initial release

## 🤝 Contributing

Issues and Pull Requests are welcome!

1. Fork the project
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License

MIT License

## 👨‍💻 Author

zjr & Qwen3.5 Plus

## 🙏 Acknowledgements

Thanks to these open-source projects:
- [FastAPI](https://fastapi.tiangolo.com/)
- [CryptoJS](https://github.com/brix/crypto-js)
- [QRCode.js](https://github.com/davidshimjs/qrcodejs)
