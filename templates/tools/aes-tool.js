// AES 加密/解密工具

(function() {
    const tool = {
        id: 'aes',
        name: 'AES 加密/解密',
        icon: '🔑',
        
        render(container) {
            container.innerHTML = `
                <div class="tool-container">
                    <h2 class="tool-title">${this.name}</h2>
                    <div class="aes-key-input">
                        <label>密钥 (16/24/32 字符)</label>
                        <input type="text" id="aesKey" placeholder="请输入密钥（16/24/32 字符）" maxlength="32">
                    </div>
                    <div class="tool-area">
                        <div>
                            <label>输入</label>
                            <textarea id="inputArea" placeholder="请输入内容..."></textarea>
                        </div>
                        <div>
                            <label>输出</label>
                            <textarea id="outputArea" placeholder="结果..." readonly></textarea>
                        </div>
                    </div>
                    <div class="tool-actions">
                        <button onclick="AESTool.aesEncrypt()">加密 →</button>
                        <button class="secondary" onclick="AESTool.aesDecrypt()">← 解密</button>
                        <button class="secondary" onclick="AESTool.clearText()">清空</button>
                        <button class="secondary" onclick="AESTool.copyOutput()">复制结果</button>
                    </div>
                    <div class="tool-info" id="toolInfo"></div>
                </div>
            `;
        },
        
        init(container) {
            // AES 工具使用按钮触发，不需要自动绑定
        },
        
        aesEncrypt() {
            const input = document.getElementById('inputArea');
            const key = document.getElementById('aesKey');
            const output = document.getElementById('outputArea');
            
            if (!key.value || key.value.length < 16) {
                ToolsCommon.showInfo('密钥至少需要 16 字符', 'error');
                return;
            }
            
            try {
                const paddedKey = key.value.padEnd(32, '0').substring(0, 32);
                const encrypted = CryptoJS.AES.encrypt(input.value, paddedKey).toString();
                output.value = encrypted;
                ToolsCommon.showInfo('✓ 加密成功', 'success');
            } catch (e) {
                output.value = '';
                ToolsCommon.showInfo('✗ 加密失败：' + e.message, 'error');
            }
        },
        
        aesDecrypt() {
            const input = document.getElementById('inputArea');
            const key = document.getElementById('aesKey');
            const output = document.getElementById('outputArea');
            
            if (!key.value || key.value.length < 16) {
                ToolsCommon.showInfo('密钥至少需要 16 字符', 'error');
                return;
            }
            
            try {
                const paddedKey = key.value.padEnd(32, '0').substring(0, 32);
                const decrypted = CryptoJS.AES.decrypt(input.value, paddedKey);
                output.value = decrypted.toString(CryptoJS.enc.Utf8);
                if (!output.value) {
                    ToolsCommon.showInfo('✗ 解密失败，请检查密钥', 'error');
                } else {
                    ToolsCommon.showInfo('✓ 解密成功', 'success');
                }
            } catch (e) {
                output.value = '';
                ToolsCommon.showInfo('✗ 解密失败：' + e.message, 'error');
            }
        },
        
        clearText() {
            ['inputArea', 'outputArea', 'aesKey'].forEach(id => {
                const el = document.getElementById(id);
                if (el) el.value = '';
            });
            ToolsCommon.showInfo('', 'info', 0);
        },
        
        copyOutput() {
            const output = document.getElementById('outputArea');
            if (output && output.value) {
                ToolsCommon.copyToClipboard(output.value, '✓ 已复制到剪贴板', '✗ 复制失败');
            }
        }
    };
    
    window.AESTool = {
        aesEncrypt: tool.aesEncrypt.bind(tool),
        aesDecrypt: tool.aesDecrypt.bind(tool),
        clearText: tool.clearText.bind(tool),
        copyOutput: tool.copyOutput.bind(tool)
    };
    
    ToolsRegistry.register(tool);
})();
