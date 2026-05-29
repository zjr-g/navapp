# NavApp - 个人导航网站

一个基于 FastAPI + SQLite 的现代化个人导航网站，支持用户认证、分类管理、链接管理和在线工具集。

![FastAPI](https://img.shields.io/badge/FastAPI-0.109.0-green)
![Python](https://img.shields.io/badge/Python-3.8+-blue)
![SQLite](https://img.shields.io/badge/SQLite-3.x-blue)
![License](https://img.shields.io/badge/License-MIT-yellow)

## ✨ 功能特性

### 🏠 核心功能
- **用户系统** - 注册/登录、JWT 认证、密码加密（bcrypt）
- **分类管理** - 自定义链接分类、排序
- **链接管理** - 添加/编辑/删除链接、自定义图标
- **搜索引擎** - 多搜索引擎切换、自定义搜索引擎
- **响应式设计** - 适配桌面和移动设备

### 🛠️ 在线工具集（10+ 工具）
- **Hash 计算** - MD5, SHA1, SHA224, SHA256, SHA384, SHA512, SHA3
- **进制转换器** - 二进制、八进制、十进制、十六进制互转
- **编码/解码** - URL, Base64, HTML 实体，Unicode, ASCII
- **文本统计** - 字符数、单词数、行数、字节大小
- **文本比较** - 逐行/字符比较、差异高亮、导出报告
- **Chmod 计算器** - Linux 权限计算、符号表示
- **二维码生成器** - 自定义颜色、尺寸、纠错等级
- **JSON 格式化** - JSON 验证和格式化
- **AES 加密/解密** - AES-256 加密解密

### 🔒 安全特性
- 密码 bcrypt 加密
- JWT Token 认证（7 天有效期）
- Token 自动过期检查
- 用户数据隔离
- XSS 防护（HTML 转义）

## 📁 项目结构

```
navapp/
├── app/
│   ├── __init__.py
│   ├── main.py              # FastAPI 应用入口
│   ├── models.py            # SQLAlchemy 数据模型
│   ├── schemas.py           # Pydantic 数据验证
│   ├── auth.py              # JWT 认证与密码加密
│   ├── database.py          # 数据库配置
│   └── routers/
│       ├── auth.py          # 认证路由
│       ├── categories.py    # 分类管理路由
│       ├── links.py         # 链接管理路由
│       └── engines.py       # 搜索引擎路由
├── templates/
│   ├── login.html           # 登录页面
│   ├── register.html        # 注册页面
│   ├── dashboard.html       # 导航主页
│   ├── tools.html           # IT 工具页面
│   └── tools/               # 工具模块（模块化设计）
│       ├── tools-core.js    # 核心：注册表 + 公共函数
│       ├── hash-tool.js     # Hash 计算
│       ├── base-tool.js     # 进制转换器
│       ├── encode-tool.js   # 编码/解码
│       ├── textstats-tool.js # 文本统计
│       ├── textdiff-tool.js  # 文本比较
│       ├── chmod-tool.js    # Chmod 计算器
│       ├── qrcode-tool.js   # 二维码生成器
│       ├── json-tool.js     # JSON 格式化
│       └── aes-tool.js      # AES 加密/解密
├── static/
│   ├── favicon.png          # 网站图标
│   ├── crypto-js.min.js     # CryptoJS 加密库
│   └── qrcode.min.js        # 二维码生成库
├── requirements.txt         # Python 依赖
└── README.md               # 项目文档
```

## 🚀 快速开始

### 环境要求
- Python 3.8+
- pip

### 方式一：直接运行

#### 安装依赖

```bash
cd navapp
pip install -r requirements.txt
```

#### 启动服务

**开发模式（自动重载）：**
```bash
python -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

**生产模式：**
```bash
python -m uvicorn app.main:app --host 0.0.0.0 --port 8000 --workers 4
```

### 方式二：Docker 部署

#### 使用 Docker Compose（推荐）

```bash
# 启动服务
docker-compose up -d

# 查看日志
docker-compose logs -f

# 停止服务
docker-compose down
```

#### 使用 Docker

```bash
# 构建镜像
docker build -t navapp .

# 运行容器
docker run -d -p 8000:8000 -v $(pwd)/navapp.db:/app/navapp.db --name navapp navapp
```

### 访问应用

打开浏览器访问：http://localhost:8000

1. 点击"立即注册"创建账号
2. 登录后进入导航主页
3. 添加分类和链接
4. 访问 `/tools` 使用在线工具

## 📊 API 接口

### 认证接口
| 方法 | 路径 | 说明 |
|------|------|------|
| POST | `/api/auth/register` | 用户注册 |
| POST | `/api/auth/login` | 用户登录 |
| GET | `/api/auth/me` | 获取当前用户信息 |

### 分类接口
| 方法 | 路径 | 说明 |
|------|------|------|
| GET | `/api/categories` | 获取所有分类 |
| POST | `/api/categories` | 创建分类 |
| PUT | `/api/categories/{id}` | 更新分类 |
| DELETE | `/api/categories/{id}` | 删除分类 |

### 链接接口
| 方法 | 路径 | 说明 |
|------|------|------|
| GET | `/api/links` | 获取所有链接 |
| POST | `/api/links` | 创建链接 |
| PUT | `/api/links/{id}` | 更新链接 |
| DELETE | `/api/links/{id}` | 删除链接 |

### 搜索引擎接口
| 方法 | 路径 | 说明 |
|------|------|------|
| GET | `/api/engines` | 获取所有搜索引擎 |
| POST | `/api/engines` | 创建搜索引擎 |
| PUT | `/api/engines/{id}` | 更新搜索引擎 |
| DELETE | `/api/engines/{id}` | 删除搜索引擎 |
| POST | `/api/engines/init-default` | 初始化默认搜索引擎 |

## 🛠️ 技术栈

### 后端
- **FastAPI** - 高性能 Web 框架
- **SQLAlchemy** - ORM 框架
- **SQLite** - 轻量级数据库
- **Pydantic** - 数据验证
- **bcrypt** - 密码加密
- **python-jose** - JWT 认证
- **Jinja2** - 模板引擎

### 前端
- **原生 JavaScript** - 无框架依赖
- **模块化设计** - 工具代码分离
- **懒加载** - 按需加载工具模块
- **CryptoJS** - 前端加密库
- **QRCode.js** - 二维码生成

## 🔧 配置说明

### 数据库配置
数据库文件默认创建在项目根目录：`navapp.db`

### 环境变量（可选）
```bash
# 生产环境请修改 SECRET_KEY
export SECRET_KEY="your-secret-key-here"
```

### 连接池配置
```python
# app/database.py
engine = create_engine(
    SQLALCHEMY_DATABASE_URL,
    pool_size=10,           # 连接池大小
    max_overflow=20,        # 最大溢出连接数
    pool_pre_ping=True,     # 连接前检查
    pool_recycle=3600       # 连接回收时间（秒）
)
```

## 📝 开发指南

### 添加新工具

1. 在 `templates/tools/` 目录创建工具文件：
```javascript
// mytool-tool.js
(function() {
    const tool = {
        id: 'mytool',
        name: '我的工具',
        icon: '🔧',
        
        render(container) {
            container.innerHTML = `<div class="tool-container">...</div>`;
        },
        
        init(container) {
            // 初始化逻辑
        }
    };
    
    ToolsRegistry.register(tool);
})();
```

2. 在 `tools-core.js` 中添加工具配置：
```javascript
standaloneTools: [
    // ... 其他工具
    { id: 'mytool', name: '我的工具', icon: '🔧' }
]
```

### 添加新 API 路由

1. 在 `app/routers/` 创建路由文件
2. 在 `app/main.py` 中注册路由

## 🐛 已知问题

暂无已知问题。

## 📄 更新日志

### v2.4 (2026-05-08) - 最新
- ✨ 暗色模式（所有页面支持，CSS 变量重构，localStorage 持久化）
- ✨ 链接搜索/过滤（跨分类搜索标题和 URL）
- ✨ 导入/导出书签（支持 JSON 和 HTML 书签格式）
- ✨ 链接健康检查（检测失效链接并标记）
- ✨ 图标本地缓存（修复 60% 图标因格式问题无法显示）

### v2.3 (2026-05-06)
- 🔒 前端 Token 过期检查优化（dashboard.html + login.html）
- 🔧 文本比较工具内存泄漏修复（MAX_COMPARE_LINES 限制）
- 💾 数据库连接池配置优化（pool_size, max_overflow, pool_pre_ping）
- 🐛 修复工具模块加载失败问题（重试机制）
- 🐛 修复 XSS 风险（HTML 拼接完全转义）

### v2.2 (2026-04-26)
- ✨ 工具模块化重构（10 个独立工具文件）
- ✨ 添加文本比较工具
- ✨ 添加 Chmod 计算器
- ✨ 添加二维码生成器
- 🔒 前端 Token 过期检查
- 🐛 修复 XSS 风险（HTML 转义）
- ⚡ 工具懒加载 + 重试机制
- 💾 数据库连接池优化

### v2.1 (2026-04-xx)
- ✨ 添加编码/解码工具
- ✨ 添加文本统计工具
- 🔒 JWT 认证系统

### v2.0 (2026-03-xx)
- ✨ 初始版本
- ✨ 用户认证系统
- ✨ 分类和链接管理
- ✨ 搜索引擎管理

## 🤝 贡献指南

欢迎提交 Issue 和 Pull Request！

1. Fork 项目
2. 创建特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 开启 Pull Request

## 📝 许可证

MIT License

## 👨‍💻 作者

zjr & Qwen3.5 Plus

## 🙏 致谢

感谢以下开源项目：
- [FastAPI](https://fastapi.tiangolo.com/)
- [CryptoJS](https://github.com/brix/crypto-js)
- [QRCode.js](https://github.com/davidshimjs/qrcodejs)
