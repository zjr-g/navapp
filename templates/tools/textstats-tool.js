// 文本统计工具

(function() {
    const tool = {
        id: 'textstats',
        name: '文本统计',
        icon: '📊',
        
        render(container) {
            container.innerHTML = `
                <div class="tool-container">
                    <h2 class="tool-title">${this.name}</h2>
                    <div class="tool-area">
                        <div style="flex: 1;">
                            <label>输入文本（最大 100 万字符）</label>
                            <textarea id="textInput" placeholder="请输入或粘贴文本..." style="min-height: 200px;"></textarea>
                        </div>
                    </div>
                    <div class="char-limit-warning" id="charLimitWarning"></div>
                    <div class="stats-grid" id="statsGrid">
                        <div class="stat-card">
                            <div class="stat-value" id="charCount">0</div>
                            <div class="stat-label">
                                <div>字符数</div>
                                <div class="stat-label-en">Characters</div>
                            </div>
                        </div>
                        <div class="stat-card">
                            <div class="stat-value" id="wordCount">0</div>
                            <div class="stat-label">
                                <div>单词数</div>
                                <div class="stat-label-en">Words</div>
                            </div>
                        </div>
                        <div class="stat-card">
                            <div class="stat-value" id="lineCount">0</div>
                            <div class="stat-label">
                                <div>行数</div>
                                <div class="stat-label-en">Lines</div>
                            </div>
                        </div>
                        <div class="stat-card">
                            <div class="stat-value" id="byteSize">0 B</div>
                            <div class="stat-label">
                                <div>字节大小</div>
                                <div class="stat-label-en">Bytes</div>
                            </div>
                        </div>
                    </div>
                </div>
            `;
        },
        
        init(container) {
            const textInput = container.querySelector('#textInput');
            const warningEl = container.querySelector('#charLimitWarning');
            
            const debouncedCalc = ToolsCommon.debounce(() => {
                this.calculateTextStats(container);
            }, 300);
            
            textInput.addEventListener('input', () => {
                if (textInput.value.length > TOOLS_CONSTS.MAX_CHARS) {
                    textInput.value = textInput.value.substring(0, TOOLS_CONSTS.MAX_CHARS);
                    warningEl.textContent = '⚠ 已截断至 100 万字符（超出部分已移除）';
                    warningEl.className = 'char-limit-error';
                } else if (textInput.value.length > TOOLS_CONSTS.WARN_CHARS) {
                    const percent = Math.round(textInput.value.length / TOOLS_CONSTS.WARN_CHARS * 50);
                    warningEl.textContent = `⚠ 已使用 ${percent}% 限制`;
                    warningEl.className = 'char-limit-warning';
                } else {
                    warningEl.textContent = '';
                    warningEl.className = '';
                }
                
                debouncedCalc();
            });
            
            this.calculateTextStats(container);
        },
        
        calculateTextStats(container) {
            const textInput = container.querySelector('#textInput');
            if (!textInput) return;
            
            const text = textInput.value;
            
            const charCount = text.length;
            const words = text.match(/\S+/g) || [];
            const wordCount = words.length;
            const lines = text.split(/\r\n|\r|\n/);
            const lineCount = text === '' ? 0 : lines.length;
            const byteSize = new TextEncoder().encode(text).length;
            
            ToolsCommon.updateStat('charCount', charCount);
            ToolsCommon.updateStat('wordCount', wordCount);
            ToolsCommon.updateStat('lineCount', lineCount);
            ToolsCommon.updateStat('byteSize', ToolsCommon.formatBytes(byteSize), false);
        }
    };
    
    ToolsRegistry.register(tool);
})();
