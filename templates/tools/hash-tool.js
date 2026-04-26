// Hash 计算工具

(function() {
    const tool = {
        id: 'hash',
        name: 'Hash 计算',
        icon: '🔏',
        
        render(container) {
            container.innerHTML = `
                <div class="tool-container">
                    <h2 class="tool-title">${this.name}</h2>
                    <div class="tool-area">
                        <div style="flex: 1;">
                            <label>输入</label>
                            <textarea id="inputArea" placeholder="请输入内容..." style="min-height: 200px;"></textarea>
                        </div>
                    </div>
                    <div class="hash-results" id="hashResults"></div>
                    <div class="tool-info" id="toolInfo"></div>
                </div>
            `;
        },
        
        init(container) {
            const input = container.querySelector('#inputArea');
            const debouncedCalc = ToolsCommon.debounce(() => this.calculateHash(container), 300);
            input.addEventListener('input', debouncedCalc);
        },
        
        calculateHash(container) {
            const input = container.querySelector('#inputArea');
            const resultsContainer = container.querySelector('#hashResults');
            const inputValue = input.value;
            
            if (!inputValue) {
                resultsContainer.innerHTML = '';
                ToolsCommon.showInfo('', 'info', 0);
                return;
            }

            try {
                const md5 = CryptoJS.MD5(inputValue).toString();
                const sha1 = CryptoJS.SHA1(inputValue).toString();
                const sha224 = CryptoJS.SHA224(inputValue).toString();
                const sha256 = CryptoJS.SHA256(inputValue).toString();
                const sha384 = CryptoJS.SHA384(inputValue).toString();
                const sha512 = CryptoJS.SHA512(inputValue).toString();
                const sha3 = CryptoJS.SHA3(inputValue).toString();

                resultsContainer.innerHTML = `
                    <div class="hash-item">
                        <label>MD5</label>
                        <span class="hash-value">${md5}</span>
                        <span class="copy-icon" onclick="ToolsCommon.copyToClipboard('${md5}')">📋</span>
                    </div>
                    <div class="hash-item">
                        <label>SHA1</label>
                        <span class="hash-value">${sha1}</span>
                        <span class="copy-icon" onclick="ToolsCommon.copyToClipboard('${sha1}')">📋</span>
                    </div>
                    <div class="hash-item">
                        <label>SHA224</label>
                        <span class="hash-value">${sha224}</span>
                        <span class="copy-icon" onclick="ToolsCommon.copyToClipboard('${sha224}')">📋</span>
                    </div>
                    <div class="hash-item">
                        <label>SHA256</label>
                        <span class="hash-value">${sha256}</span>
                        <span class="copy-icon" onclick="ToolsCommon.copyToClipboard('${sha256}')">📋</span>
                    </div>
                    <div class="hash-item">
                        <label>SHA384</label>
                        <span class="hash-value">${sha384}</span>
                        <span class="copy-icon" onclick="ToolsCommon.copyToClipboard('${sha384}')">📋</span>
                    </div>
                    <div class="hash-item">
                        <label>SHA512</label>
                        <span class="hash-value">${sha512}</span>
                        <span class="copy-icon" onclick="ToolsCommon.copyToClipboard('${sha512}')">📋</span>
                    </div>
                    <div class="hash-item">
                        <label>SHA3</label>
                        <span class="hash-value">${sha3}</span>
                        <span class="copy-icon" onclick="ToolsCommon.copyToClipboard('${sha3}')">📋</span>
                    </div>
                `;
            } catch (e) {
                resultsContainer.innerHTML = '';
                ToolsCommon.showInfo('✗ 计算失败：' + e.message, 'error');
            }
        }
    };
    
    ToolsRegistry.register(tool);
})();
