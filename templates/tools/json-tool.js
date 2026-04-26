// JSON 格式化工具

(function() {
    const tool = {
        id: 'json',
        name: 'JSON 格式化',
        icon: '{}',
        
        render(container) {
            container.innerHTML = `
                <div class="tool-container">
                    <h2 class="tool-title">${this.name}</h2>
                    <div class="tool-area">
                        <div>
                            <label>输入</label>
                            <textarea id="inputArea" placeholder="请输入 JSON..."></textarea>
                        </div>
                        <div>
                            <label>输出</label>
                            <textarea id="outputArea" placeholder="格式化结果..." readonly></textarea>
                        </div>
                    </div>
                    <div class="tool-info" id="toolInfo"></div>
                </div>
            `;
        },
        
        init(container) {
            const input = container.querySelector('#inputArea');
            const debouncedFormat = ToolsCommon.debounce(() => {
                this.autoProcess(container);
            }, 300);
            input.addEventListener('input', debouncedFormat);
        },
        
        autoProcess(container) {
            const input = container.querySelector('#inputArea');
            const output = container.querySelector('#outputArea');
            const inputValue = input.value;
            
            try {
                const obj = JSON.parse(inputValue);
                output.value = JSON.stringify(obj, null, 2);
                ToolsCommon.showInfo('✓ 有效的 JSON', 'success');
            } catch {
                output.value = '';
                ToolsCommon.showInfo('✗ 无效的 JSON', 'error');
            }
        }
    };
    
    ToolsRegistry.register(tool);
})();
