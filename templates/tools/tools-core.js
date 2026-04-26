// IT 工具核心模块 - 工具注册表 + 公共函数

(function() {
    // 常量
    window.TOOLS_CONSTS = {
        MAX_CHARS: 1000000,
        WARN_CHARS: 500000
    };

    // 工具注册表
    window.ToolsRegistry = {
        tools: {},
        loaded: {},
        
        register(tool) {
            this.tools[tool.id] = tool;
        },
        
        get(id) {
            return this.tools[id];
        },
        
        getAll() {
            return this.tools;
        },
        
        // 懒加载工具
        async loadTool(id, retryCount = 0, maxRetries = 3) {
            if (this.loaded[id]) {
                return this.tools[id];
            }
            
            return new Promise((resolve, reject) => {
                const script = document.createElement('script');
                script.src = `/templates/tools/${id}-tool.js`;
                
                script.onload = () => {
                    this.loaded[id] = true;
                    resolve(this.tools[id]);
                };
                
                script.onerror = () => {
                    if (retryCount < maxRetries) {
                        console.log(`加载工具 ${id} 失败，重试 ${retryCount + 1}/${maxRetries}...`);
                        setTimeout(() => {
                            document.head.removeChild(script);
                            this.loadTool(id, retryCount + 1, maxRetries)
                                .then(resolve)
                                .catch(reject);
                        }, 500 * (retryCount + 1));
                    } else {
                        reject(new Error(`加载工具 ${id} 失败，已重试 ${maxRetries} 次`));
                    }
                };
                
                document.head.appendChild(script);
            });
        }
    };

    // 公共函数
    window.ToolsCommon = {
        // 复制到剪贴板
        async copyToClipboard(text, successMsg = '✓ 已复制', errorMsg = '✗ 复制失败') {
            if (!text) {
                this.showInfo('✗ 没有可复制的内容', 'error');
                return false;
            }
            
            try {
                await navigator.clipboard.writeText(text);
                this.showInfo(successMsg, 'success');
                return true;
            } catch (e) {
                this.showInfo(errorMsg, 'error');
                return false;
            }
        },
        
        // 从 textarea 复制
        copyFromElement(elementId, successMsg, errorMsg) {
            const element = document.getElementById(elementId);
            if (!element) return false;
            
            const value = element.value || element.textContent;
            return this.copyToClipboard(value.trim(), successMsg, errorMsg);
        },
        
        // 防抖
        debounce(fn, delay) {
            let timer = null;
            return function(...args) {
                if (timer) clearTimeout(timer);
                timer = setTimeout(() => {
                    fn.apply(this, args);
                }, delay);
            };
        },
        
        // 显示提示消息
        showInfo(message, type = 'info', duration = 1500) {
            const infoEl = document.getElementById('toolInfo');
            if (!infoEl) return;
            
            infoEl.textContent = message;
            infoEl.className = `tool-info ${type}`;
            
            if (duration > 0) {
                setTimeout(() => {
                    infoEl.textContent = '';
                    infoEl.className = 'tool-info';
                }, duration);
            }
        },
        
        // 格式化数字
        formatNumber(num) {
            return num.toLocaleString('en-US');
        },
        
        // 格式化字节
        formatBytes(bytes) {
            if (bytes === 0) return '0 B';
            const k = 1024;
            const sizes = ['B', 'KB', 'MB', 'GB'];
            const i = Math.floor(Math.log(bytes) / Math.log(k));
            return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
        },
        
        // HTML 转义
        escapeHtml(text) {
            const div = document.createElement('div');
            div.textContent = text;
            return div.innerHTML;
        },
        
        // 获取元素值
        getValue(id) {
            const el = document.getElementById(id);
            return el ? (el.value || el.textContent) : '';
        },
        
        // 设置元素值
        setValue(id, value) {
            const el = document.getElementById(id);
            if (el) {
                if (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA') {
                    el.value = value;
                } else {
                    el.textContent = value;
                }
            }
        },
        
        // 更新统计数字
        updateStat(id, value, isNumber = true) {
            const el = document.getElementById(id);
            if (el) {
                el.textContent = isNumber ? this.formatNumber(value) : value;
            }
        },
        
        // 创建带复制图标的结果项
        createResultItem(label, value, copyId) {
            return `
                <div class="hash-item">
                    <label>${label}</label>
                    <span class="hash-value">${value}</span>
                    <span class="copy-icon" onclick="ToolsCommon.copyFromElement('${copyId}', '✓ 已复制', '✗ 复制失败')">📋</span>
                </div>
            `;
        }
    };

    // 工具配置
    window.ToolsConfig = {
        standaloneTools: [
            { id: 'base', name: '进制转换器', icon: '🔢' },
            { id: 'hash', name: 'Hash 计算', icon: '🔏' },
            { id: 'encode', name: '编码/解码', icon: '📝' },
            { id: 'textstats', name: '文本统计', icon: '📊' },
            { id: 'textdiff', name: '文本比较', icon: '🔀' },
            { id: 'chmod', name: 'Chmod 计算器', icon: '🔒' },
            { id: 'qrcode', name: '二维码生成器', icon: '📱' }
        ],
        
        toolCategories: [
            {
                id: 'format',
                name: '代码/文本格式化',
                icon: '📄',
                tools: [
                    { id: 'json', name: 'JSON 格式化', icon: '{}' }
                ]
            },
            {
                id: 'crypto',
                name: '加密/解密',
                icon: '🔐',
                tools: [
                    { id: 'aes', name: 'AES 加密/解密', icon: '🔑' }
                ]
            }
        ]
    };

    console.log('Tools core loaded');
})();
