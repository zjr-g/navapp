// 编码/解码工具

(function() {
    let conversionLock = false;
    let currentEncodeType = 'url';
    
    const tool = {
        id: 'encode',
        name: '编码/解码',
        icon: '📝',
        
        render(container) {
            container.innerHTML = `
                <div class="tool-container">
                    <h2 class="tool-title">${this.name}</h2>
                    <div class="tool-area">
                        <div>
                            <label>编码</label>
                            <textarea id="encodedArea" placeholder="编码后的文本..."></textarea>
                            <span class="copy-icon" onclick="ToolsCommon.copyFromElement('encodedArea', '✓ 已复制', '✗ 复制失败')">📋</span>
                        </div>
                        <div class="encode-select-container">
                            <label>编码方式</label>
                            <select id="encodeType" class="encode-select" onchange="EncodeTool.switchEncodeType()">
                                <option value="url">URL</option>
                                <option value="base64">Base64</option>
                                <option value="html">HTML 实体</option>
                                <option value="unicode">Unicode 转义</option>
                                <option value="ascii">ASCII 码</option>
                            </select>
                        </div>
                        <div>
                            <label>解码</label>
                            <textarea id="decodedArea" placeholder="解码后的文本..."></textarea>
                            <span class="copy-icon" onclick="ToolsCommon.copyFromElement('decodedArea', '✓ 已复制', '✗ 复制失败')">📋</span>
                        </div>
                    </div>
                    <div class="tool-info" id="toolInfo"></div>
                </div>
            `;
        },
        
        init(container) {
            const encodedArea = container.querySelector('#encodedArea');
            const decodedArea = container.querySelector('#decodedArea');
            
            const debouncedConvert = ToolsCommon.debounce((source) => {
                this.convertEncode(source, container);
            }, 300);
            
            encodedArea.addEventListener('input', () => {
                debouncedConvert('encoded');
            });
            
            decodedArea.addEventListener('input', () => {
                debouncedConvert('decoded');
            });
        },
        
        switchEncodeType() {
            currentEncodeType = document.getElementById('encodeType').value;
            const encodedArea = document.getElementById('encodedArea');
            const decodedArea = document.getElementById('decodedArea');
            
            const encodeNames = { url: 'URL', base64: 'Base64', html: 'HTML 实体', unicode: 'Unicode', ascii: 'ASCII' };
            ToolsCommon.showInfo(`已切换到 ${encodeNames[currentEncodeType] || currentEncodeType} 编码`, 'success');
            
            if (encodedArea.value) {
                this.convertEncode('encoded', document.getElementById('content'));
            } else if (decodedArea.value) {
                this.convertEncode('decoded', document.getElementById('content'));
            }
        },
        
        convertEncode(source, container) {
            if (conversionLock) return;
            conversionLock = true;
            
            const encodedArea = container.querySelector('#encodedArea');
            const decodedArea = container.querySelector('#decodedArea');
            
            try {
                if (source === 'encoded') {
                    const encoded = encodedArea.value;
                    if (!encoded) {
                        decodedArea.value = '';
                        ToolsCommon.showInfo('', 'info', 0);
                    } else {
                        switch (currentEncodeType) {
                            case 'url':
                                decodedArea.value = decodeURIComponent(encoded);
                                break;
                            case 'base64':
                                decodedArea.value = decodeURIComponent(escape(atob(encoded)));
                                break;
                            case 'html':
                                const div1 = document.createElement('div');
                                div1.innerHTML = encoded;
                                decodedArea.value = div1.textContent;
                                break;
                            case 'unicode':
                                decodedArea.value = encoded.replace(/\\u([0-9a-fA-F]{4})/g, (_, code) => String.fromCharCode(parseInt(code, 16)));
                                break;
                            case 'ascii':
                                const asciiCodes = encoded.trim().split(/\s+/);
                                for (const code of asciiCodes) {
                                    const num = parseInt(code);
                                    if (isNaN(num) || num < 0 || num > 127) {
                                        throw new Error('含有非 ASCII 字符，无法转换');
                                    }
                                }
                                decodedArea.value = asciiCodes.map(code => String.fromCharCode(parseInt(code))).join('');
                                break;
                        }
                        ToolsCommon.showInfo('', 'info', 0);
                    }
                } else {
                    const decoded = decodedArea.value;
                    if (!decoded) {
                        encodedArea.value = '';
                        ToolsCommon.showInfo('', 'info', 0);
                    } else {
                        switch (currentEncodeType) {
                            case 'url':
                                encodedArea.value = encodeURIComponent(decoded);
                                break;
                            case 'base64':
                                encodedArea.value = btoa(unescape(encodeURIComponent(decoded)));
                                break;
                            case 'html':
                                encodedArea.value = decoded.replace(/[\u00-\u1F\u7F-\u9F]/g, ch => '&#' + ch.charCodeAt(0) + ';');
                                break;
                            case 'unicode':
                                encodedArea.value = decoded.replace(/[\u4e00-\u9fa5]/g, ch => '\\u' + ch.charCodeAt(0).toString(16).padStart(4, '0'));
                                break;
                            case 'ascii':
                                for (let i = 0; i < decoded.length; i++) {
                                    const code = decoded.charCodeAt(i);
                                    if (code < 0 || code > 127) {
                                        throw new Error('含有非 ASCII 字符，无法转换');
                                    }
                                }
                                encodedArea.value = decoded.split('').map(ch => ch.charCodeAt(0)).join(' ');
                                break;
                        }
                        ToolsCommon.showInfo('', 'info', 0);
                    }
                }
            } catch (e) {
                ToolsCommon.showInfo('✗ 转换失败：' + e.message, 'error', 0);
            }
            
            setTimeout(() => {
                conversionLock = false;
            }, 50);
        }
    };
    
    // 暴露 switchEncodeType 供全局调用
    window.EncodeTool = {
        switchEncodeType: tool.switchEncodeType.bind(tool),
        convertEncode: tool.convertEncode.bind(tool)
    };
    
    ToolsRegistry.register(tool);
})();
