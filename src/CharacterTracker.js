export class CharacterTracker {
    constructor() {
        this.characters = new Map();
        this.currentCharacter = null;
        this.interface = null;
    }
    
    init() {
        this.loadCharacters();
        this.createInterface();
    }
    
    // 加载角色数据
    loadCharacters() {
        const saved = localStorage.getItem('characterTracker_data');
        if (saved) {
            try {
                const data = JSON.parse(saved);
                this.characters = new Map(data);
            } catch (e) {
                console.error('Failed to load character data:', e);
            }
        }
    }
    
    // 保存角色数据
    saveCharacters() {
        try {
            const data = Array.from(this.characters.entries());
            localStorage.setItem('characterTracker_data', JSON.stringify(data));
        } catch (e) {
            console.error('Failed to save character data:', e);
        }
    }
    
    // 创建界面
    createInterface() {
        this.interface = document.createElement('div');
        this.interface.id = 'character-tracker-interface';
        this.interface.className = 'character-tracker-interface';
        this.interface.style.display = 'none';
        
        this.interface.innerHTML = `
            <div class="ct-header">
                <h2>👥 Character Tracker</h2>
                <button class="ct-close-btn" onclick="this.parentElement.parentElement.style.display='none'">×</button>
            </div>
            
            <div class="ct-tabs">
                <button class="ct-tab active" onclick="window.CharacterTrackerPlugin.characterTracker.switchTab('characters')">Characters</button>
                <button class="ct-tab" onclick="window.CharacterTrackerPlugin.characterTracker.switchTab('personality')">Personality</button>
                <button class="ct-tab" onclick="window.CharacterTrackerPlugin.characterTracker.switchTab('relationships')">Relationships</button>
                <button class="ct-tab" onclick="window.CharacterTrackerPlugin.characterTracker.switchTab('analysis')">Analysis</button>
            </div>
            
            <div class="ct-content">
                <div id="ct-characters-tab" class="ct-tab-content active">
                    <div class="ct-characters-list">
                        <button class="ct-add-character-btn" onclick="window.CharacterTrackerPlugin.characterTracker.addNewCharacter()">+ Add New Character</button>
                        <div id="ct-characters-container"></div>
                    </div>
                </div>
                
                <div id="ct-personality-tab" class="ct-tab-content">
                    <div id="ct-personality-content"></div>
                </div>
                
                <div id="ct-relationships-tab" class="ct-tab-content">
                    <div id="ct-relationships-content"></div>
                </div>
                
                <div id="ct-analysis-tab" class="ct-tab-content">
                    <div id="ct-analysis-content"></div>
                </div>
            </div>
        `;
        
        document.body.appendChild(this.interface);
        this.renderCharactersList();
    }
    
    // 显示界面
    showInterface() {
        this.interface.style.display = 'block';
        this.renderCharactersList();
    }
    
    // 切换标签页
    switchTab(tabName) {
        // 隐藏所有标签页内容
        document.querySelectorAll('.ct-tab-content').forEach(tab => {
            tab.classList.remove('active');
        });
        
        // 移除所有标签页的active类
        document.querySelectorAll('.ct-tab').forEach(tab => {
            tab.classList.remove('active');
        });
        
        // 显示选中的标签页
        document.getElementById(`ct-${tabName}-tab`).classList.add('active');
        
        // 激活对应的标签按钮
        event.target.classList.add('active');
        
        // 根据标签页加载内容
        switch(tabName) {
            case 'characters':
                this.renderCharactersList();
                break;
            case 'personality':
                this.renderPersonalityTab();
                break;
            case 'relationships':
                this.renderRelationshipsTab();
                break;
            case 'analysis':
                this.renderAnalysisTab();
                break;
        }
    }
    
    // 渲染角色列表
    renderCharactersList() {
        const container = document.getElementById('ct-characters-container');
        if (!container) return;
        
        container.innerHTML = '';
        
        if (this.characters.size === 0) {
            container.innerHTML = '<p class="ct-no-characters">No characters added yet. Click "Add New Character" to get started.</p>';
            return;
        }
        
        this.characters.forEach((character, name) => {
            const charElement = document.createElement('div');
            charElement.className = 'ct-character-item';
            charElement.innerHTML = `
                <div class="ct-character-info">
                    <h3>${character.name}</h3>
                    <p><strong>Role:</strong> ${character.role || 'Unknown'}</p>
                    <p><strong>Personality Traits:</strong> ${character.personalityTraits.length} traits</p>
                    <p><strong>Relationships:</strong> ${character.relationships.length} connections</p>
                </div>
                <div class="ct-character-actions">
                    <button onclick="window.CharacterTrackerPlugin.characterTracker.editCharacter('${name}')">Edit</button>
                    <button onclick="window.CharacterTrackerPlugin.characterTracker.deleteCharacter('${name}')">Delete</button>
                </div>
            `;
            container.appendChild(charElement);
        });
    }
    
    // 添加新角色
    addNewCharacter() {
        const name = prompt('Enter character name:');
        if (!name || this.characters.has(name)) {
            alert('Character name is required and must be unique!');
            return;
        }
        
        const role = prompt('Enter character role:') || '';
        
        const character = {
            name: name,
            role: role,
            personalityTraits: [],
            relationships: [],
            notes: '',
            createdAt: new Date().toISOString()
        };
        
        this.characters.set(name, character);
        this.saveCharacters();
        this.renderCharactersList();
        
        // 自动切换到编辑模式
        this.editCharacter(name);
    }
    
    // 编辑角色
    editCharacter(name) {
        const character = this.characters.get(name);
        if (!character) return;
        
        this.currentCharacter = character;
        this.showCharacterEditor();
    }
    
    // 删除角色
    deleteCharacter(name) {
        if (confirm(`Are you sure you want to delete ${name}?`)) {
            this.characters.delete(name);
            this.saveCharacters();
            this.renderCharactersList();
        }
    }
    
    // 显示角色编辑器
    showCharacterEditor() {
        if (!this.currentCharacter) return;
        
        const editor = document.createElement('div');
        editor.className = 'ct-character-editor';
        editor.innerHTML = `
            <div class="ct-editor-header">
                <h3>Editing: ${this.currentCharacter.name}</h3>
                <button onclick="this.parentElement.parentElement.remove()">Close</button>
            </div>
            
            <div class="ct-editor-content">
                <div class="ct-editor-section">
                    <h4>Basic Information</h4>
                    <label>Role: <input type="text" id="ct-role-input" value="${this.currentCharacter.role || ''}"></label>
                    <label>Notes: <textarea id="ct-notes-input">${this.currentCharacter.notes || ''}</textarea></label>
                </div>
                
                <div class="ct-editor-section">
                    <h4>Personality Traits</h4>
                    <div class="ct-trait-input">
                        <input type="text" id="ct-trait-name" placeholder="Trait name">
                        <input type="number" id="ct-trait-weight" placeholder="Weight (1-10)" min="1" max="10" value="5">
                        <button onclick="window.CharacterTrackerPlugin.characterTracker.addPersonalityTrait()">Add Trait</button>
                    </div>
                    <div id="ct-traits-list"></div>
                </div>
                
                <div class="ct-editor-section">
                    <h4>Relationships</h4>
                    <div class="ct-relationship-input">
                        <input type="text" id="ct-relationship-target" placeholder="Character name">
                        <select id="ct-relationship-type">
                            <option value="friend">Friend</option>
                            <option value="enemy">Enemy</option>
                            <option value="lover">Lover</option>
                            <option value="family">Family</option>
                            <option value="colleague">Colleague</option>
                            <option value="other">Other</option>
                        </select>
                        <textarea id="ct-relationship-notes" placeholder="Relationship notes"></textarea>
                        <button onclick="window.CharacterTrackerPlugin.characterTracker.addRelationship()">Add Relationship</button>
                    </div>
                    <div id="ct-relationships-list"></div>
                </div>
                
                <div class="ct-editor-actions">
                    <button onclick="window.CharacterTrackerPlugin.characterTracker.saveCharacter()">Save Changes</button>
                </div>
            </div>
        `;
        
        document.body.appendChild(editor);
        this.renderTraitsList();
        this.renderRelationshipsList();
    }
    
    // 添加性格特征
    addPersonalityTrait() {
        const nameInput = document.getElementById('ct-trait-name');
        const weightInput = document.getElementById('ct-trait-weight');
        
        const name = nameInput.value.trim();
        const weight = parseInt(weightInput.value);
        
        if (!name || weight < 1 || weight > 10) {
            alert('Please enter a valid trait name and weight (1-10)');
            return;
        }
        
        // 检查是否已存在相同特征
        const existingIndex = this.currentCharacter.personalityTraits.findIndex(t => t.name === name);
        if (existingIndex >= 0) {
            this.currentCharacter.personalityTraits[existingIndex].weight = weight;
        } else {
            this.currentCharacter.personalityTraits.push({ name, weight });
        }
        
        nameInput.value = '';
        weightInput.value = '5';
        this.renderTraitsList();
    }
    
    // 渲染特征列表
    renderTraitsList() {
        const container = document.getElementById('ct-traits-list');
        if (!container) return;
        
        container.innerHTML = '';
        
        this.currentCharacter.personalityTraits.forEach((trait, index) => {
            const traitElement = document.createElement('div');
            traitElement.className = 'ct-trait-item';
            traitElement.innerHTML = `
                <span class="ct-trait-name">${trait.name}</span>
                <span class="ct-trait-weight">${trait.weight}/10</span>
                <button onclick="window.CharacterTrackerPlugin.characterTracker.removePersonalityTrait(${index})">Remove</button>
            `;
            container.appendChild(traitElement);
        });
    }
    
    // 移除性格特征
    removePersonalityTrait(index) {
        this.currentCharacter.personalityTraits.splice(index, 1);
        this.renderTraitsList();
    }
    
    // 添加关系
    addRelationship() {
        const targetInput = document.getElementById('ct-relationship-target');
        const typeInput = document.getElementById('ct-relationship-type');
        const notesInput = document.getElementById('ct-relationship-notes');
        
        const target = targetInput.value.trim();
        const type = typeInput.value;
        const notes = notesInput.value.trim();
        
        if (!target) {
            alert('Please enter a character name');
            return;
        }
        
        // 检查是否已存在相同关系
        const existingIndex = this.currentCharacter.relationships.findIndex(r => r.target === target);
        if (existingIndex >= 0) {
            this.currentCharacter.relationships[existingIndex] = { target, type, notes };
        } else {
            this.currentCharacter.relationships.push({ target, type, notes });
        }
        
        targetInput.value = '';
        typeInput.value = 'friend';
        notesInput.value = '';
        this.renderRelationshipsList();
    }
    
    // 渲染关系列表
    renderRelationshipsList() {
        const container = document.getElementById('ct-relationships-list');
        if (!container) return;
        
        container.innerHTML = '';
        
        this.currentCharacter.relationships.forEach((relationship, index) => {
            const relElement = document.createElement('div');
            relElement.className = 'ct-relationship-item';
            relElement.innerHTML = `
                <span class="ct-relationship-target">${relationship.target}</span>
                <span class="ct-relationship-type">${relationship.type}</span>
                <span class="ct-relationship-notes">${relationship.notes}</span>
                <button onclick="window.CharacterTrackerPlugin.characterTracker.removeRelationship(${index})">Remove</button>
            `;
            container.appendChild(relElement);
        });
    }
    
    // 移除关系
    removeRelationship(index) {
        this.currentCharacter.relationships.splice(index, 1);
        this.renderRelationshipsList();
    }
    
    // 保存角色
    saveCharacter() {
        const roleInput = document.getElementById('ct-role-input');
        const notesInput = document.getElementById('ct-notes-input');
        
        this.currentCharacter.role = roleInput.value.trim();
        this.currentCharacter.notes = notesInput.value.trim();
        
        this.characters.set(this.currentCharacter.name, this.currentCharacter);
        this.saveCharacters();
        
        alert('Character saved successfully!');
        document.querySelector('.ct-character-editor').remove();
        this.renderCharactersList();
    }
    
    // 渲染性格标签页
    renderPersonalityTab() {
        const container = document.getElementById('ct-personality-content');
        if (!container) return;
        
        if (this.characters.size === 0) {
            container.innerHTML = '<p>No characters to analyze. Add some characters first.</p>';
            return;
        }
        
        container.innerHTML = `
            <div class="ct-personality-selector">
                <label>Select Character: 
                    <select id="ct-personality-character-select" onchange="window.CharacterTrackerPlugin.characterTracker.updatePersonalityDisplay()">
                        <option value="">Choose a character...</option>
                        ${Array.from(this.characters.keys()).map(name => 
                            `<option value="${name}">${name}</option>`
                        ).join('')}
                    </select>
                </label>
            </div>
            <div id="ct-personality-display"></div>
        `;
    }
    
    // 更新性格显示
    updatePersonalityDisplay() {
        const select = document.getElementById('ct-personality-character-select');
        const display = document.getElementById('ct-personality-display');
        
        if (!select || !display) return;
        
        const selectedName = select.value;
        if (!selectedName) {
            display.innerHTML = '';
            return;
        }
        
        const character = this.characters.get(selectedName);
        if (!character) return;
        
        if (character.personalityTraits.length === 0) {
            display.innerHTML = '<p>This character has no personality traits defined.</p>';
            return;
        }
        
        // 生成性格饼图
        window.CharacterTrackerPlugin.personalityAnalyzer.generatePersonalityChart(character, display);
    }
    
    // 渲染关系标签页
    renderRelationshipsTab() {
        const container = document.getElementById('ct-relationships-content');
        if (!container) return;
        
        if (this.characters.size === 0) {
            container.innerHTML = '<p>No characters to analyze. Add some characters first.</p>';
            return;
        }
        
        container.innerHTML = `
            <div class="ct-relationships-selector">
                <label>Select Character: 
                    <select id="ct-relationships-character-select" onchange="window.CharacterTrackerPlugin.characterTracker.updateRelationshipsDisplay()">
                        <option value="">Choose a character...</option>
                        ${Array.from(this.characters.keys()).map(name => 
                            `<option value="${name}">${name}</option>`
                        ).join('')}
                    </select>
                </label>
            </div>
            <div id="ct-relationships-display"></div>
        `;
    }
    
    // 更新关系显示
    updateRelationshipsDisplay() {
        const select = document.getElementById('ct-relationships-character-select');
        const display = document.getElementById('ct-relationships-display');
        
        if (!select || !display) return;
        
        const selectedName = select.value;
        if (!selectedName) {
            display.innerHTML = '';
            return;
        }
        
        const character = this.characters.get(selectedName);
        if (!character) return;
        
        window.CharacterTrackerPlugin.relationshipNetwork.renderRelationshipNetwork(character, display);
    }
    
    // 渲染分析标签页
    renderAnalysisTab() {
        const container = document.getElementById('ct-analysis-content');
        if (!container) return;
        
        if (this.characters.size === 0) {
            container.innerHTML = '<p>No characters to analyze. Add some characters first.</p>';
            return;
        }
        
        container.innerHTML = `
            <div class="ct-analysis-controls">
                <button onclick="window.CharacterTrackerPlugin.characterTracker.generateAIReport()">Generate AI Report</button>
                <button onclick="window.CharacterTrackerPlugin.characterTracker.exportData()">Export Data</button>
            </div>
            <div id="ct-analysis-results"></div>
        `;
    }
    
    // 生成AI报告
    generateAIReport() {
        const results = document.getElementById('ct-analysis-results');
        if (!results) return;
        
        let report = '## Character Analysis Report\n\n';
        
        this.characters.forEach((character, name) => {
            report += `### ${name}\n`;
            report += `**Role:** ${character.role || 'Unknown'}\n`;
            report += `**Personality Traits:**\n`;
            
            if (character.personalityTraits.length > 0) {
                character.personalityTraits.forEach(trait => {
                    report += `- ${trait.name}: ${trait.weight}/10\n`;
                });
            } else {
                report += '- No traits defined\n';
            }
            
            report += `**Relationships:**\n`;
            if (character.relationships.length > 0) {
                character.relationships.forEach(rel => {
                    report += `- ${rel.target} (${rel.type}): ${rel.notes}\n`;
                });
            } else {
                report += '- No relationships defined\n';
            }
            
            report += `**Notes:** ${character.notes || 'None'}\n\n`;
        });
        
        // 生成性格比重饼图数据
        const personalityData = this.generatePersonalityData();
        report += `## Personality Distribution\n\n`;
        report += `**Total Characters:** ${this.characters.size}\n`;
        report += `**Personality Traits Distribution:**\n`;
        
        Object.entries(personalityData).forEach(([trait, count]) => {
            const percentage = ((count / this.characters.size) * 100).toFixed(1);
            report += `- ${trait}: ${count} characters (${percentage}%)\n`;
        });
        
        results.innerHTML = `
            <div class="ct-report">
                <h3>AI Report Generated</h3>
                <textarea readonly style="width: 100%; height: 400px; font-family: monospace;">${report}</textarea>
                <button onclick="navigator.clipboard.writeText(this.previousElementSibling.value)">Copy to Clipboard</button>
            </div>
        `;
    }
    
    // 生成性格数据统计
    generatePersonalityData() {
        const traitCounts = {};
        
        this.characters.forEach(character => {
            character.personalityTraits.forEach(trait => {
                if (!traitCounts[trait.name]) {
                    traitCounts[trait.name] = 0;
                }
                traitCounts[trait.name]++;
            });
        });
        
        return traitCounts;
    }
    
    // 导出数据
    exportData() {
        const data = {
            characters: Array.from(this.characters.entries()),
            exportDate: new Date().toISOString(),
            version: '1.0.0'
        };
        
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        
        const a = document.createElement('a');
        a.href = url;
        a.download = 'character-tracker-data.json';
        a.click();
        
        URL.revokeObjectURL(url);
    }
} 