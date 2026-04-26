// Chmod 计算器工具

(function() {
    const tool = {
        id: 'chmod',
        name: 'Chmod 计算器',
        icon: '🔒',
        
        render(container) {
            container.innerHTML = `
                <div class="tool-container">
                    <h2 class="tool-title">${this.name}</h2>
                    <div class="chmod-container">
                        <div class="chmod-filename-input">
                            <label>文件名（可选）</label>
                            <input type="text" id="chmodFilename" placeholder="例如：script.sh" oninput="ChmodTool.calculateChmod()">
                        </div>
                        <div class="chmod-permission-grid">
                            <div class="chmod-permission-group">
                                <h4>所有者</h4>
                                <div class="digit-display" id="ownerDigit">0</div>
                                <div class="chmod-checkbox-row">
                                    <div class="chmod-checkbox-item">
                                        <label><input type="checkbox" data-group="owner" data-perm="r" onchange="ChmodTool.calculateChmod()"> R</label>
                                    </div>
                                    <div class="chmod-checkbox-item">
                                        <label><input type="checkbox" data-group="owner" data-perm="w" onchange="ChmodTool.calculateChmod()"> W</label>
                                    </div>
                                    <div class="chmod-checkbox-item">
                                        <label><input type="checkbox" data-group="owner" data-perm="x" onchange="ChmodTool.calculateChmod()"> X</label>
                                    </div>
                                </div>
                            </div>
                            <div class="chmod-permission-group">
                                <h4>组</h4>
                                <div class="digit-display" id="groupDigit">0</div>
                                <div class="chmod-checkbox-row">
                                    <div class="chmod-checkbox-item">
                                        <label><input type="checkbox" data-group="group" data-perm="r" onchange="ChmodTool.calculateChmod()"> R</label>
                                    </div>
                                    <div class="chmod-checkbox-item">
                                        <label><input type="checkbox" data-group="group" data-perm="w" onchange="ChmodTool.calculateChmod()"> W</label>
                                    </div>
                                    <div class="chmod-checkbox-item">
                                        <label><input type="checkbox" data-group="group" data-perm="x" onchange="ChmodTool.calculateChmod()"> X</label>
                                    </div>
                                </div>
                            </div>
                            <div class="chmod-permission-group">
                                <h4>其他</h4>
                                <div class="digit-display" id="otherDigit">0</div>
                                <div class="chmod-checkbox-row">
                                    <div class="chmod-checkbox-item">
                                        <label><input type="checkbox" data-group="other" data-perm="r" onchange="ChmodTool.calculateChmod()"> R</label>
                                    </div>
                                    <div class="chmod-checkbox-item">
                                        <label><input type="checkbox" data-group="other" data-perm="w" onchange="ChmodTool.calculateChmod()"> W</label>
                                    </div>
                                    <div class="chmod-checkbox-item">
                                        <label><input type="checkbox" data-group="other" data-perm="x" onchange="ChmodTool.calculateChmod()"> X</label>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div class="chmod-results">
                            <div class="chmod-result-item">
                                <label>八进制权限</label>
                                <span class="result-value" id="octalResult">000</span>
                                <span class="copy-icon" onclick="ToolsCommon.copyFromElement('octalResult', '✓ 已复制', '✗ 复制失败')">📋</span>
                            </div>
                            <div class="chmod-result-item">
                                <label>符号表示</label>
                                <span class="result-value" id="symbolResult">---------</span>
                                <span class="copy-icon" onclick="ToolsCommon.copyFromElement('symbolResult', '✓ 已复制', '✗ 复制失败')">📋</span>
                            </div>
                            <div class="chmod-result-item">
                                <label>完整命令</label>
                                <span class="result-value" id="commandResult">chmod 000</span>
                                <span class="copy-icon" onclick="ChmodTool.copyChmodCommand()">📋</span>
                            </div>
                        </div>
                    </div>
                    <div class="tool-actions">
                        <button class="secondary" onclick="ChmodTool.clearChmod()">清空</button>
                        <button class="secondary" onclick="ChmodTool.presetChmod('644')">644</button>
                        <button class="secondary" onclick="ChmodTool.presetChmod('755')">755</button>
                        <button class="secondary" onclick="ChmodTool.presetChmod('777')">777</button>
                    </div>
                    <div class="tool-info" id="toolInfo"></div>
                </div>
            `;
        },
        
        init(container) {
            this.calculateChmod();
        },
        
        calculateChmod() {
            const permissions = {
                owner: { r: 0, w: 0, x: 0 },
                group: { r: 0, w: 0, x: 0 },
                other: { r: 0, w: 0, x: 0 }
            };
            
            document.querySelectorAll('.chmod-permission-group input[type="checkbox"]').forEach(cb => {
                if (cb.checked) {
                    permissions[cb.dataset.group][cb.dataset.perm] = 1;
                }
            });
            
            const ownerDigit = permissions.owner.r * 4 + permissions.owner.w * 2 + permissions.owner.x * 1;
            const groupDigit = permissions.group.r * 4 + permissions.group.w * 2 + permissions.group.x * 1;
            const otherDigit = permissions.other.r * 4 + permissions.other.w * 2 + permissions.other.x * 1;
            
            const octalValue = `${ownerDigit}${groupDigit}${otherDigit}`;
            const symbolValue = 
                (permissions.owner.r ? 'r' : '-') + (permissions.owner.w ? 'w' : '-') + (permissions.owner.x ? 'x' : '-') +
                (permissions.group.r ? 'r' : '-') + (permissions.group.w ? 'w' : '-') + (permissions.group.x ? 'x' : '-') +
                (permissions.other.r ? 'r' : '-') + (permissions.other.w ? 'w' : '-') + (permissions.other.x ? 'x' : '-');
            
            const filename = document.getElementById('chmodFilename')?.value.trim() || '';
            const commandValue = filename ? `chmod ${octalValue} ${filename}` : `chmod ${octalValue}`;
            
            ToolsCommon.setValue('ownerDigit', ownerDigit);
            ToolsCommon.setValue('groupDigit', groupDigit);
            ToolsCommon.setValue('otherDigit', otherDigit);
            ToolsCommon.setValue('octalResult', octalValue);
            ToolsCommon.setValue('symbolResult', symbolValue);
            ToolsCommon.setValue('commandResult', commandValue);
        },
        
        copyChmodCommand() {
            const value = document.getElementById('commandResult').textContent;
            ToolsCommon.copyToClipboard(value, '✓ 已复制', '✗ 复制失败');
        },
        
        clearChmod() {
            document.querySelectorAll('.chmod-permission-group input[type="checkbox"]').forEach(cb => cb.checked = false);
            const filenameInput = document.getElementById('chmodFilename');
            if (filenameInput) filenameInput.value = '';
            
            ToolsCommon.setValue('ownerDigit', '0');
            ToolsCommon.setValue('groupDigit', '0');
            ToolsCommon.setValue('otherDigit', '0');
            ToolsCommon.setValue('octalResult', '000');
            ToolsCommon.setValue('symbolResult', '---------');
            ToolsCommon.setValue('commandResult', 'chmod 000');
            ToolsCommon.showInfo('', 'info', 0);
        },
        
        presetChmod(value) {
            const owner = parseInt(value[0]);
            const group = parseInt(value[1]);
            const other = parseInt(value[2]);
            
            document.querySelectorAll('.chmod-permission-group input[type="checkbox"]').forEach(cb => cb.checked = false);
            
            const setPermissions = (grp, digit) => {
                const rCb = document.querySelector(`input[data-group="${grp}"][data-perm="r"]`);
                const wCb = document.querySelector(`input[data-group="${grp}"][data-perm="w"]`);
                const xCb = document.querySelector(`input[data-group="${grp}"][data-perm="x"]`);
                if (rCb) rCb.checked = (digit & 4) !== 0;
                if (wCb) wCb.checked = (digit & 2) !== 0;
                if (xCb) xCb.checked = (digit & 1) !== 0;
            };
            
            setPermissions('owner', owner);
            setPermissions('group', group);
            setPermissions('other', other);
            
            this.calculateChmod();
            ToolsCommon.showInfo(`✓ 已设置为 ${value}`, 'success');
        }
    };
    
    window.ChmodTool = {
        calculateChmod: tool.calculateChmod.bind(tool),
        copyChmodCommand: tool.copyChmodCommand.bind(tool),
        clearChmod: tool.clearChmod.bind(tool),
        presetChmod: tool.presetChmod.bind(tool)
    };
    
    ToolsRegistry.register(tool);
})();
