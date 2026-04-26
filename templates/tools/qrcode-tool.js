// 二维码生成器工具

(function() {
    let qrcodeObj = null;
    
    const tool = {
        id: 'qrcode',
        name: '二维码生成器',
        icon: '📱',
        
        render(container) {
            container.innerHTML = `
                <div class="tool-container">
                    <h2 class="tool-title">${this.name}</h2>
                    <div class="qrcode-container">
                        <div class="qrcode-input-area">
                            <label>内容（文本或 URL）</label>
                            <textarea id="qrcodeInput" placeholder="请输入要生成二维码的内容..." maxlength="2953"></textarea>
                            <div class="char-count" id="qrcodeCharCount">0 / 2953 字符</div>
                        </div>
                        <div class="qrcode-settings">
                            <div class="qrcode-setting-item">
                                <label>纠错等级</label>
                                <select id="qrcodeErrorLevel" onchange="QRCodeTool.generateQRCode()">
                                    <option value="L">L - 低 (~7%)</option>
                                    <option value="M" selected>M - 中 (~15%)</option>
                                    <option value="Q">Q - 较高 (~25%)</option>
                                    <option value="H">H - 高 (~30%)</option>
                                </select>
                            </div>
                            <div class="qrcode-setting-item">
                                <label>尺寸</label>
                                <select id="qrcodeSize" onchange="QRCodeTool.generateQRCode()">
                                    <option value="128">128 x 128</option>
                                    <option value="256" selected>256 x 256</option>
                                    <option value="512">512 x 512</option>
                                </select>
                            </div>
                        </div>
                        <div class="qrcode-color-settings">
                            <div class="qrcode-color-item">
                                <input type="color" id="qrcodeColorDark" value="#000000" onchange="QRCodeTool.generateQRCode()">
                                <label>前景色</label>
                            </div>
                            <div class="qrcode-color-item">
                                <input type="color" id="qrcodeColorLight" value="#ffffff" onchange="QRCodeTool.generateQRCode()">
                                <label>背景色</label>
                            </div>
                        </div>
                        <div class="qrcode-display">
                            <div id="qrcodeCanvas"></div>
                            <div class="qrcode-error" id="qrcodeError"></div>
                        </div>
                        <div class="qrcode-actions">
                            <button class="secondary" onclick="QRCodeTool.downloadQRCode()">下载 PNG</button>
                            <button class="secondary" onclick="QRCodeTool.copyQRCode()">复制图片</button>
                            <button class="secondary" onclick="QRCodeTool.clearQRCode()">清空</button>
                        </div>
                    </div>
                    <div class="tool-info" id="toolInfo"></div>
                </div>
            `;
        },
        
        init(container) {
            const input = container.querySelector('#qrcodeInput');
            const charCount = container.querySelector('#qrcodeCharCount');
            
            const debouncedGenerate = ToolsCommon.debounce(() => {
                this.generateQRCode();
            }, 300);
            
            input.addEventListener('input', () => {
                const count = input.value.length;
                charCount.textContent = `${count} / 2953 字符`;
                
                if (count > 2000) {
                    charCount.className = 'char-count error';
                } else if (count > 1000) {
                    charCount.className = 'char-count warning';
                } else {
                    charCount.className = 'char-count';
                }
                
                debouncedGenerate();
            });
            
            this.generateQRCode();
        },
        
        generateQRCode() {
            const input = document.getElementById('qrcodeInput');
            const errorLevel = document.getElementById('qrcodeErrorLevel');
            const size = document.getElementById('qrcodeSize');
            const colorDark = document.getElementById('qrcodeColorDark');
            const colorLight = document.getElementById('qrcodeColorLight');
            const canvas = document.getElementById('qrcodeCanvas');
            const error = document.getElementById('qrcodeError');
            
            if (!input || !canvas) return;
            
            const text = input.value.trim();
            
            if (!text) {
                canvas.innerHTML = '';
                if (error) error.textContent = '';
                qrcodeObj = null;
                return;
            }
            
            try {
                canvas.innerHTML = '';
                const correctLevel = QRCode.CorrectLevel[errorLevel.value];
                
                qrcodeObj = new QRCode(canvas, {
                    text: text,
                    width: parseInt(size.value),
                    height: parseInt(size.value),
                    colorDark: colorDark.value,
                    colorLight: colorLight.value,
                    correctLevel: correctLevel
                });
                
                if (error) error.textContent = '';
                ToolsCommon.showInfo('✓ 二维码已生成', 'success');
            } catch (e) {
                if (error) error.textContent = '✗ 生成失败：' + e.message;
                ToolsCommon.showInfo('✗ 生成失败', 'error');
                qrcodeObj = null;
            }
        },
        
        downloadQRCode() {
            const canvas = document.getElementById('qrcodeCanvas');
            
            if (!canvas || !qrcodeObj) {
                ToolsCommon.showInfo('✗ 先生成二维码', 'error');
                return;
            }
            
            try {
                const img = canvas.querySelector('img');
                if (img && img.src) {
                    const link = document.createElement('a');
                    link.href = img.src;
                    link.download = `qrcode_${Date.now()}.png`;
                    document.body.appendChild(link);
                    link.click();
                    document.body.removeChild(link);
                    ToolsCommon.showInfo('✓ 已下载', 'success');
                } else {
                    const canvasEl = canvas.querySelector('canvas');
                    if (canvasEl) {
                        const link = document.createElement('a');
                        link.href = canvasEl.toDataURL('image/png');
                        link.download = `qrcode_${Date.now()}.png`;
                        document.body.appendChild(link);
                        link.click();
                        document.body.removeChild(link);
                        ToolsCommon.showInfo('✓ 已下载', 'success');
                    }
                }
            } catch (e) {
                ToolsCommon.showInfo('✗ 下载失败：' + e.message, 'error');
            }
        },
        
        copyQRCode() {
            const canvas = document.getElementById('qrcodeCanvas');
            
            if (!canvas || !qrcodeObj) {
                ToolsCommon.showInfo('✗ 先生成二维码', 'error');
                return;
            }
            
            try {
                const img = canvas.querySelector('img');
                if (img && img.src) {
                    fetch(img.src)
                        .then(response => response.blob())
                        .then(blob => {
                            navigator.clipboard.write([
                                new ClipboardItem({ 'image/png': blob })
                            ]).then(() => {
                                ToolsCommon.showInfo('✓ 已复制到剪贴板', 'success');
                            }).catch(() => {
                                ToolsCommon.showInfo('✗ 复制失败，浏览器不支持', 'error');
                            });
                        })
                        .catch(() => {
                            ToolsCommon.showInfo('✗ 复制失败', 'error');
                        });
                } else {
                    ToolsCommon.showInfo('✗ 复制失败', 'error');
                }
            } catch (e) {
                ToolsCommon.showInfo('✗ 复制失败：' + e.message, 'error');
            }
        },
        
        clearQRCode() {
            const input = document.getElementById('qrcodeInput');
            const canvas = document.getElementById('qrcodeCanvas');
            const charCount = document.getElementById('qrcodeCharCount');
            const error = document.getElementById('qrcodeError');
            
            if (input) input.value = '';
            if (canvas) canvas.innerHTML = '';
            if (charCount) {
                charCount.textContent = '0 / 2953 字符';
                charCount.className = 'char-count';
            }
            if (error) error.textContent = '';
            ToolsCommon.showInfo('', 'info', 0);
            
            qrcodeObj = null;
        }
    };
    
    window.QRCodeTool = {
        generateQRCode: tool.generateQRCode.bind(tool),
        downloadQRCode: tool.downloadQRCode.bind(tool),
        copyQRCode: tool.copyQRCode.bind(tool),
        clearQRCode: tool.clearQRCode.bind(tool)
    };
    
    ToolsRegistry.register(tool);
})();
