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

                const createHashItem = (label, value) => {
                    const item = document.createElement('div');
                    item.className = 'hash-item';
                    
                    const labelEl = document.createElement('label');
                    labelEl.textContent = label;
                    
                    const valueEl = document.createElement('span');
                    valueEl.className = 'hash-value';
                    valueEl.textContent = value;
                    
                    const copyIcon = document.createElement('span');
                    copyIcon.className = 'copy-icon';
                    copyIcon.textContent = '📋';
                    copyIcon.onclick = () => ToolsCommon.copyToClipboard(value, '✓ 已复制', '✗ 复制失败');
                    
                    item.appendChild(labelEl);
                    item.appendChild(valueEl);
                    item.appendChild(copyIcon);
                    return item;
                };

                resultsContainer.innerHTML = '';
                resultsContainer.appendChild(createHashItem('MD5', md5));
                resultsContainer.appendChild(createHashItem('SHA1', sha1));
                resultsContainer.appendChild(createHashItem('SHA224', sha224));
                resultsContainer.appendChild(createHashItem('SHA256', sha256));
                resultsContainer.appendChild(createHashItem('SHA384', sha384));
                resultsContainer.appendChild(createHashItem('SHA512', sha512));
                resultsContainer.appendChild(createHashItem('SHA3', sha3));
                
                ToolsCommon.showInfo('', 'info', 0);
            } catch (e) {
                resultsContainer.innerHTML = '';
                ToolsCommon.showInfo('✗ 计算失败', 'error');
            }
        }
    };
    
    ToolsRegistry.register(tool);
})();
