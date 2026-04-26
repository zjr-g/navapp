// 进制转换器工具

(function() {
    let prefixState = { bin: false, oct: false, hex: false };
    
    const tool = {
        id: 'base',
        name: '进制转换器',
        icon: '🔢',
        
        render(container) {
            container.innerHTML = `
                <div class="tool-container">
                    <h2 class="tool-title">${this.name}</h2>
                    <div class="base-inputs">
                        <div class="base-input-item">
                            <label>二进制</label>
                            <input type="text" id="binInput" placeholder="例如：1010 或 0b1010" spellcheck="false">
                            <button class="prefix-btn" onclick="BaseTool.togglePrefix('binInput', '0b')">0b</button>
                            <span class="copy-icon" onclick="ToolsCommon.copyFromElement('binInput', '✓ 已复制', '✗ 复制失败')">📋</span>
                        </div>
                        <div class="base-input-item">
                            <label>八进制</label>
                            <input type="text" id="octInput" placeholder="例如：12 或 0o12" spellcheck="false">
                            <button class="prefix-btn" onclick="BaseTool.togglePrefix('octInput', '0o')">0o</button>
                            <span class="copy-icon" onclick="ToolsCommon.copyFromElement('octInput', '✓ 已复制', '✗ 复制失败')">📋</span>
                        </div>
                        <div class="base-input-item">
                            <label>十进制</label>
                            <input type="text" id="decInput" placeholder="例如：10" spellcheck="false">
                            <span class="copy-icon" onclick="ToolsCommon.copyFromElement('decInput', '✓ 已复制', '✗ 复制失败')">📋</span>
                        </div>
                        <div class="base-input-item">
                            <label>十六进制</label>
                            <input type="text" id="hexInput" placeholder="例如：A 或 0xA" spellcheck="false">
                            <button class="prefix-btn" onclick="BaseTool.togglePrefix('hexInput', '0x')">0x</button>
                            <span class="copy-icon" onclick="ToolsCommon.copyFromElement('hexInput', '✓ 已复制', '✗ 复制失败')">📋</span>
                        </div>
                    </div>
                    <div class="tool-info" id="toolInfo" style="text-align: center;"></div>
                </div>
            `;
        },
        
        init(container) {
            const inputs = [
                container.querySelector('#binInput'),
                container.querySelector('#octInput'),
                container.querySelector('#decInput'),
                container.querySelector('#hexInput')
            ];
            
            const debouncedConvert = ToolsCommon.debounce((index, value) => {
                this.convertFromBase(index, value, container);
            }, 300);
            
            inputs.forEach((input, index) => {
                input.addEventListener('input', () => {
                    debouncedConvert(index, input.value.trim());
                });
            });
        },
        
        convertSegment(segment, baseIndex) {
            const cleanValue = segment.replace(/^0[bBoOxX]/, '');
            
            switch (baseIndex) {
                case 0:
                    if (!/^[01]+$/.test(cleanValue)) throw new Error('无效的二进制');
                    return BigInt('0b' + cleanValue);
                case 1:
                    if (!/^[0-7]+$/.test(cleanValue)) throw new Error('无效的八进制');
                    return BigInt('0o' + cleanValue);
                case 2:
                    if (!/^[0-9]+$/.test(cleanValue)) throw new Error('无效的十进制');
                    return BigInt(cleanValue);
                case 3:
                    if (!/^[0-9a-fA-F]+$/.test(cleanValue)) throw new Error('无效的十六进制');
                    return BigInt('0x' + cleanValue);
                default:
                    throw new Error('无效的进制');
            }
        },
        
        convertFromBase(baseIndex, value, container) {
            const inputs = [
                container.querySelector('#binInput'),
                container.querySelector('#octInput'),
                container.querySelector('#decInput'),
                container.querySelector('#hexInput')
            ];
            
            if (!value) {
                inputs.forEach((input, i) => {
                    if (i !== baseIndex) input.value = '';
                });
                ToolsCommon.showInfo('', 'info', 0);
                return;
            }
            
            try {
                const hasSpaces = value.includes(' ');
                const segments = value.trim().split(/\s+/);
                
                let decimals;
                if (hasSpaces) {
                    decimals = segments.map(segment => this.convertSegment(segment, baseIndex));
                } else {
                    decimals = [this.convertSegment(value, baseIndex)];
                }
                
                const bin = decimals.map(d => d.toString(2)).join(' ');
                const oct = decimals.map(d => d.toString(8)).join(' ');
                const dec = decimals.map(d => d.toString(10)).join(' ');
                const hex = decimals.map(d => d.toString(16).toUpperCase()).join(' ');
                
                inputs[0].value = prefixState.bin ? '0b' + bin : bin;
                inputs[1].value = prefixState.oct ? '0o' + oct : oct;
                inputs[2].value = dec;
                inputs[3].value = prefixState.hex ? '0x' + hex : hex;
                
                ToolsCommon.showInfo('', 'info', 0);
            } catch (e) {
                inputs.forEach((input, i) => {
                    if (i !== baseIndex) input.value = '';
                });
                ToolsCommon.showInfo('✗ 无效的数字', 'error');
            }
        },
        
        togglePrefix(inputId, prefix) {
            const input = document.getElementById(inputId);
            let value = input.value.trim();
            
            if (!value) {
                input.focus();
                return;
            }
            
            const cleanValue = value.replace(/^0[bBoOxX]/, '');
            const hasPrefix = value.toLowerCase().startsWith(prefix.toLowerCase());
            
            if (hasPrefix) {
                input.value = cleanValue;
                if (inputId === 'binInput') prefixState.bin = false;
                if (inputId === 'octInput') prefixState.oct = false;
                if (inputId === 'hexInput') prefixState.hex = false;
            } else {
                input.value = prefix + cleanValue;
                if (inputId === 'binInput') prefixState.bin = true;
                if (inputId === 'octInput') prefixState.oct = true;
                if (inputId === 'hexInput') prefixState.hex = true;
            }
            
            input.dispatchEvent(new Event('input'));
        }
    };
    
    // 暴露 togglePrefix 供全局调用
    window.BaseTool = {
        togglePrefix: tool.togglePrefix.bind(tool),
        convertFromBase: tool.convertFromBase.bind(tool)
    };
    
    ToolsRegistry.register(tool);
})();
