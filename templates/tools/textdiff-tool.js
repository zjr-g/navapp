// 文本比较工具

(function() {
    let currentDiffMode = 'line';
    let currentDiffResult = null;
    
    const tool = {
        id: 'textdiff',
        name: '文本比较',
        icon: '🔀',
        
        render(container) {
            container.innerHTML = `
                <div class="tool-container">
                    <h2 class="tool-title">${this.name}</h2>
                    <div class="diff-compare-mode">
                        <label>比较模式</label>
                        <select id="diffMode" onchange="TextDiffTool.onDiffModeChange()">
                            <option value="line">逐行比较</option>
                            <option value="char">字符比较</option>
                        </select>
                        <div class="diff-options">
                            <label><input type="checkbox" id="ignoreEmpty" onchange="TextDiffTool.autoCompareText()"> 忽略空行</label>
                            <label><input type="checkbox" id="ignoreWhitespace" onchange="TextDiffTool.autoCompareText()"> 忽略空格</label>
                            <label><input type="checkbox" id="showDiffOnly" onchange="TextDiffTool.onShowDiffOnlyChange()"> 仅显示差异</label>
                        </div>
                    </div>
                    <div class="tool-area">
                        <div>
                            <label>文本 A（原文）</label>
                            <textarea id="textA" placeholder="请输入原文本..." style="min-height: 200px;"></textarea>
                        </div>
                        <div>
                            <label>文本 B（新文）</label>
                            <textarea id="textB" placeholder="请输入新文本..." style="min-height: 200px;"></textarea>
                        </div>
                    </div>
                    <div class="tool-actions">
                        <button class="secondary" onclick="TextDiffTool.clearDiffText()">清空</button>
                        <button class="secondary" onclick="TextDiffTool.swapTexts()">交换文本</button>
                        <button class="secondary" onclick="TextDiffTool.exportDiffReport()">导出报告</button>
                    </div>
                    <div class="diff-stats-grid" id="diffStats">
                        <div class="diff-stat-card total">
                            <div class="stat-value" id="totalLines">0</div>
                            <div class="stat-label">总行数<br>Total Lines</div>
                        </div>
                        <div class="diff-stat-card same">
                            <div class="stat-value" id="sameLines">0</div>
                            <div class="stat-label">相同行数<br>Same Lines</div>
                        </div>
                        <div class="diff-stat-card diff">
                            <div class="stat-value" id="diffLines">0</div>
                            <div class="stat-label">差异行数<br>Different Lines</div>
                        </div>
                        <div class="diff-stat-card added">
                            <div class="stat-value" id="addedLines">0</div>
                            <div class="stat-label">新增行数<br>Added Lines</div>
                        </div>
                        <div class="diff-stat-card removed">
                            <div class="stat-value" id="removedLines">0</div>
                            <div class="stat-label">删除行数<br>Removed Lines</div>
                        </div>
                    </div>
                    <div class="diff-results-container" id="diffResults">
                        <div class="diff-results-header">
                            <div>行号</div>
                            <div>文本 A（原文）</div>
                            <div>文本 B（新文）</div>
                        </div>
                        <div class="diff-results-body" id="diffResultsBody"></div>
                    </div>
                    <div class="tool-info" id="toolInfo"></div>
                </div>
            `;
        },
        
        init(container) {
            const textA = container.querySelector('#textA');
            const textB = container.querySelector('#textB');
            
            const debouncedCompare = ToolsCommon.debounce(() => {
                this.autoCompareText();
            }, 300);
            
            textA.addEventListener('input', () => {
                if (textA.value.length > TOOLS_CONSTS.MAX_CHARS) {
                    textA.value = textA.value.substring(0, TOOLS_CONSTS.MAX_CHARS);
                }
                debouncedCompare();
            });
            
            textB.addEventListener('input', () => {
                if (textB.value.length > TOOLS_CONSTS.MAX_CHARS) {
                    textB.value = textB.value.substring(0, TOOLS_CONSTS.MAX_CHARS);
                }
                debouncedCompare();
            });
            
            this.autoCompareText();
        },
        
        onDiffModeChange() {
            currentDiffMode = document.getElementById('diffMode').value;
            this.autoCompareText();
        },
        
        onShowDiffOnlyChange() {
            const showDiffOnly = document.getElementById('showDiffOnly').checked;
            const container = document.getElementById('diffResults');
            if (container) {
                container.classList.toggle('show-diff-only', showDiffOnly);
            }
        },
        
        autoCompareText() {
            const textA = document.getElementById('textA');
            const textB = document.getElementById('textB');
            if (!textA || !textB) return;
            
            this.compareText(textA.value, textB.value);
        },
        
        diffLines(textA, textB, ignoreEmpty = false, ignoreWhitespace = false) {
            let linesA = textA.split(/\r\n|\r|\n/);
            let linesB = textB.split(/\r\n|\r|\n/);
            
            if (ignoreWhitespace) {
                linesA = linesA.map(l => l.trim().replace(/\s+/g, ' '));
                linesB = linesB.map(l => l.trim().replace(/\s+/g, ' '));
            }
            
            if (ignoreEmpty) {
                linesA = linesA.filter(l => l.trim() !== '');
                linesB = linesB.filter(l => l.trim() !== '');
            }
            
            const maxLen = Math.max(linesA.length, linesB.length);
            const result = [];
            let sameCount = 0, diffCount = 0, addedCount = 0, removedCount = 0;
            
            for (let i = 0; i < maxLen; i++) {
                const lineA = i < linesA.length ? linesA[i] : null;
                const lineB = i < linesB.length ? linesB[i] : null;
                
                if (lineA === null) {
                    result.push({ type: 'added', lineA: null, lineB: lineB, lineNumA: null, lineNumB: i + 1 });
                    addedCount++;
                } else if (lineB === null) {
                    result.push({ type: 'removed', lineA: lineA, lineB: null, lineNumA: i + 1, lineNumB: null });
                    removedCount++;
                } else if (lineA === lineB) {
                    result.push({ type: 'same', lineA: lineA, lineB: lineB, lineNumA: i + 1, lineNumB: i + 1 });
                    sameCount++;
                } else {
                    result.push({ type: 'diff', lineA: lineA, lineB: lineB, lineNumA: i + 1, lineNumB: i + 1 });
                    diffCount++;
                }
            }
            
            return { diffs: result, stats: { total: maxLen, same: sameCount, diff: diffCount, added: addedCount, removed: removedCount } };
        },
        
        diffChars(lineA, lineB) {
            if (lineA === lineB) return ToolsCommon.escapeHtml(lineA);
            
            let result = '';
            let i = 0, j = 0;
            
            while (i < lineA.length || j < lineB.length) {
                if (i < lineA.length && j < lineB.length && lineA[i] === lineB[j]) {
                    result += ToolsCommon.escapeHtml(lineA[i]);
                    i++;
                    j++;
                } else {
                    let delChars = '', insChars = '';
                    while (i < lineA.length && (j >= lineB.length || lineA[i] !== lineB[j])) {
                        delChars += lineA[i++];
                    }
                    while (j < lineB.length && (i >= lineA.length || lineA[i] !== lineB[j])) {
                        insChars += lineB[j++];
                    }
                    if (delChars) result += '<del>' + ToolsCommon.escapeHtml(delChars) + '</del>';
                    if (insChars) result += '<ins>' + ToolsCommon.escapeHtml(insChars) + '</ins>';
                }
            }
            return result;
        },
        
        compareText(textA, textB) {
            const ignoreEmpty = document.getElementById('ignoreEmpty')?.checked || false;
            const ignoreWhitespace = document.getElementById('ignoreWhitespace')?.checked || false;
            const diffMode = currentDiffMode;
            
            const resultsBody = document.getElementById('diffResultsBody');
            
            if (!textA && !textB) {
                ['totalLines', 'sameLines', 'diffLines', 'addedLines', 'removedLines'].forEach(id => {
                    ToolsCommon.updateStat(id, 0);
                });
                if (resultsBody) resultsBody.innerHTML = '';
                ToolsCommon.showInfo('', 'info', 0);
                currentDiffResult = null;
                return;
            }
            
            try {
                let result;
                if (diffMode === 'line') {
                    result = this.diffLines(textA, textB, ignoreEmpty, ignoreWhitespace);
                } else {
                    const lineResult = this.diffLines(textA, textB, ignoreEmpty, ignoreWhitespace);
                    result = {
                        diffs: lineResult.diffs.map(item => {
                            if (item.type === 'diff') {
                                return { ...item, lineAHtml: this.diffChars(item.lineA, item.lineB), lineBHtml: this.diffChars(item.lineA, item.lineB) };
                            }
                            return item;
                        }),
                        stats: lineResult.stats
                    };
                }
                
                currentDiffResult = result;
                
                ToolsCommon.updateStat('totalLines', result.stats.total);
                ToolsCommon.updateStat('sameLines', result.stats.same);
                ToolsCommon.updateStat('diffLines', result.stats.diff);
                ToolsCommon.updateStat('addedLines', result.stats.added);
                ToolsCommon.updateStat('removedLines', result.stats.removed);
                
                if (resultsBody) {
                    let html = '';
                    result.diffs.forEach(item => {
                        const rowClass = item.type;
                        const lineNumCell = item.type === 'added' ? `<div>-</div>` : `<div>${item.lineNumA || '-'}</div>`;
                        
                        let cellA, cellB;
                        if (item.type === 'same') {
                            cellA = `<div>${ToolsCommon.escapeHtml(item.lineA || '')}</div>`;
                            cellB = `<div>${ToolsCommon.escapeHtml(item.lineB || '')}</div>`;
                        } else if (item.type === 'removed') {
                            cellA = `<div>${ToolsCommon.escapeHtml(item.lineA || '')}</div>`;
                            cellB = `<div></div>`;
                        } else if (item.type === 'added') {
                            cellA = `<div></div>`;
                            cellB = `<div>${ToolsCommon.escapeHtml(item.lineB || '')}</div>`;
                        } else if (item.type === 'diff') {
                            if (diffMode === 'char' && item.lineAHtml) {
                                cellA = `<div class="char-diff">${item.lineAHtml}</div>`;
                                cellB = `<div class="char-diff">${item.lineBHtml}</div>`;
                            } else {
                                cellA = `<div>${ToolsCommon.escapeHtml(item.lineA || '')}</div>`;
                                cellB = `<div>${ToolsCommon.escapeHtml(item.lineB || '')}</div>`;
                            }
                        }
                        
                        html += `<div class="diff-row ${rowClass}">${lineNumCell}${cellA}${cellB}</div>`;
                    });
                    resultsBody.innerHTML = html;
                }
                
                const showDiffOnly = document.getElementById('showDiffOnly')?.checked || false;
                const container = document.getElementById('diffResults');
                if (container) container.classList.toggle('show-diff-only', showDiffOnly);
                
                ToolsCommon.showInfo(`✓ 比较完成：${result.stats.diff} 处差异`, 'success');
            } catch (e) {
                if (resultsBody) resultsBody.innerHTML = '';
                ToolsCommon.showInfo('✗ 比较失败：' + e.message, 'error');
                currentDiffResult = null;
            }
        },
        
        clearDiffText() {
            ['textA', 'textB', 'diffResultsBody'].forEach(id => {
                const el = document.getElementById(id);
                if (el) {
                    if (el.tagName === 'TEXTAREA') el.value = '';
                    else el.innerHTML = '';
                }
            });
            ['totalLines', 'sameLines', 'diffLines', 'addedLines', 'removedLines'].forEach(id => {
                ToolsCommon.updateStat(id, 0);
            });
            ToolsCommon.showInfo('', 'info', 0);
            currentDiffResult = null;
        },
        
        swapTexts() {
            const textA = document.getElementById('textA');
            const textB = document.getElementById('textB');
            if (!textA || !textB) return;
            const temp = textA.value;
            textA.value = textB.value;
            textB.value = temp;
            this.autoCompareText();
        },
        
        exportDiffReport() {
            if (!currentDiffResult || currentDiffResult.diffs.length === 0) {
                ToolsCommon.showInfo('✗ 没有可导出的比较结果', 'error');
                setTimeout(() => ToolsCommon.showInfo('', 'info', 0), 2000);
                return;
            }
            
            const textA = document.getElementById('textA')?.value || '';
            const textB = document.getElementById('textB')?.value || '';
            
            let report = `文本比较报告\n================\n\n`;
            report += `比较时间：${new Date().toLocaleString('zh-CN')}\n`;
            report += `比较模式：${currentDiffMode === 'line' ? '逐行比较' : '字符比较'}\n`;
            report += `忽略空行：${document.getElementById('ignoreEmpty')?.checked ? '是' : '否'}\n`;
            report += `忽略空格：${document.getElementById('ignoreWhitespace')?.checked ? '是' : '否'}\n\n`;
            report += `统计信息：\n  总行数：${currentDiffResult.stats.total}\n  相同行数：${currentDiffResult.stats.same}\n`;
            report += `  差异行数：${currentDiffResult.stats.diff}\n  新增行数：${currentDiffResult.stats.added}\n  删除行数：${currentDiffResult.stats.removed}\n\n`;
            report += `文本 A 长度：${textA.length} 字符\n文本 B 长度：${textB.length} 字符\n\n差异详情：\n----------------\n`;
            
            currentDiffResult.diffs.forEach((item, index) => {
                if (item.type !== 'same') {
                    report += `\n[${index + 1}] ${item.type === 'added' ? '新增' : item.type === 'removed' ? '删除' : '差异'}\n`;
                    if (item.lineNumA) report += `  原文行 ${item.lineNumA}: ${item.lineA}\n`;
                    if (item.lineNumB) report += `  新文行 ${item.lineNumB}: ${item.lineB}\n`;
                }
            });
            
            const blob = new Blob([report], { type: 'text/plain;charset=utf-8' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `文本比较报告_${Date.now()}.txt`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
            
            ToolsCommon.showInfo('✓ 报告已导出', 'success');
        }
    };
    
    window.TextDiffTool = {
        onDiffModeChange: tool.onDiffModeChange.bind(tool),
        onShowDiffOnlyChange: tool.onShowDiffOnlyChange.bind(tool),
        autoCompareText: tool.autoCompareText.bind(tool),
        clearDiffText: tool.clearDiffText.bind(tool),
        swapTexts: tool.swapTexts.bind(tool),
        exportDiffReport: tool.exportDiffReport.bind(tool)
    };
    
    ToolsRegistry.register(tool);
})();
