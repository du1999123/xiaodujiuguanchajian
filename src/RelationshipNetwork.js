export class RelationshipNetwork {
    constructor() {
        this.relationshipTypes = {
            friend: { color: '#4CAF50', label: 'Friend' },
            enemy: { color: '#F44336', label: 'Enemy' },
            lover: { color: '#E91E63', label: 'Lover' },
            family: { color: '#2196F3', label: 'Family' },
            colleague: { color: '#FF9800', label: 'Colleague' },
            other: { color: '#9C27B0', label: 'Other' }
        };
    }
    
    init() {
        // 初始化关系网络功能
    }
    
    // 渲染关系网络
    renderRelationshipNetwork(character, container) {
        if (!character || !character.relationships || character.relationships.length === 0) {
            container.innerHTML = '<p>No relationships defined for this character.</p>';
            return;
        }
        
        container.innerHTML = `
            <div class="ct-relationship-overview">
                <h3>${character.name}'s Relationship Network</h3>
                <div class="ct-relationship-stats">
                    <div class="ct-relationship-count">
                        <span class="ct-count-number">${character.relationships.length}</span>
                        <span class="ct-count-label">Total Connections</span>
                    </div>
                    <div class="ct-relationship-breakdown">
                        ${this.generateRelationshipBreakdown(character)}
                    </div>
                </div>
            </div>
            
            <div class="ct-relationship-visualization">
                <h4>Relationship Map</h4>
                <div class="ct-relationship-map">
                    ${this.generateRelationshipMap(character)}
                </div>
            </div>
            
            <div class="ct-relationship-details">
                <h4>Detailed Relationships</h4>
                <div class="ct-relationships-list">
                    ${this.generateRelationshipsList(character)}
                </div>
            </div>
            
            <div class="ct-relationship-insights">
                <h4>Relationship Insights</h4>
                <div class="ct-insights-content">
                    ${this.generateRelationshipInsights(character)}
                </div>
            </div>
        `;
    }
    
    // 生成关系分类统计
    generateRelationshipBreakdown(character) {
        const breakdown = {};
        
        // 统计各类型关系的数量
        character.relationships.forEach(rel => {
            if (!breakdown[rel.type]) {
                breakdown[rel.type] = 0;
            }
            breakdown[rel.type]++;
        });
        
        // 生成HTML
        return Object.entries(breakdown).map(([type, count]) => {
            const typeInfo = this.relationshipTypes[type] || this.relationshipTypes.other;
            return `
                <div class="ct-relationship-type-count">
                    <span class="ct-type-color" style="background-color: ${typeInfo.color}"></span>
                    <span class="ct-type-name">${typeInfo.label}</span>
                    <span class="ct-type-count">${count}</span>
                </div>
            `;
        }).join('');
    }
    
    // 生成关系地图
    generateRelationshipMap(character) {
        const relationships = character.relationships;
        
        if (relationships.length === 0) {
            return '<p>No relationships to visualize.</p>';
        }
        
        // 创建关系网络图
        const mapContainer = document.createElement('div');
        mapContainer.className = 'ct-relationship-network';
        
        // 中心角色
        const centerNode = document.createElement('div');
        centerNode.className = 'ct-center-node';
        centerNode.innerHTML = `
            <div class="ct-node-content">
                <strong>${character.name}</strong>
                <small>${character.role || 'Unknown Role'}</small>
            </div>
        `;
        mapContainer.appendChild(centerNode);
        
        // 关系节点
        relationships.forEach((rel, index) => {
            const relNode = document.createElement('div');
            relNode.className = 'ct-relationship-node';
            relNode.style.setProperty('--node-index', index);
            relNode.style.setProperty('--total-nodes', relationships.length);
            
            const typeInfo = this.relationshipTypes[rel.type] || this.relationshipTypes.other;
            
            relNode.innerHTML = `
                <div class="ct-node-content" style="border-color: ${typeInfo.color}">
                    <strong>${rel.target}</strong>
                    <small>${typeInfo.label}</small>
                    ${rel.notes ? `<div class="ct-relationship-note">${rel.notes}</div>` : ''}
                </div>
            `;
            
            mapContainer.appendChild(relNode);
        });
        
        return mapContainer.outerHTML;
    }
    
    // 生成关系列表
    generateRelationshipsList(character) {
        return character.relationships.map(rel => {
            const typeInfo = this.relationshipTypes[rel.type] || this.relationshipTypes.other;
            return `
                <div class="ct-relationship-item-detailed">
                    <div class="ct-relationship-header">
                        <span class="ct-relationship-target">${rel.target}</span>
                        <span class="ct-relationship-type-badge" style="background-color: ${typeInfo.color}">
                            ${typeInfo.label}
                        </span>
                    </div>
                    ${rel.notes ? `<div class="ct-relationship-notes">${rel.notes}</div>` : ''}
                    <div class="ct-relationship-actions">
                        <button onclick="window.CharacterTrackerPlugin.characterTracker.editRelationship('${character.name}', '${rel.target}')">Edit</button>
                        <button onclick="window.CharacterTrackerPlugin.characterTracker.removeRelationship('${character.name}', '${rel.target}')">Remove</button>
                    </div>
                </div>
            `;
        }).join('');
    }
    
    // 生成关系洞察
    generateRelationshipInsights(character) {
        const insights = [];
        const relationships = character.relationships;
        
        if (relationships.length === 0) {
            return '<p>No relationships to analyze.</p>';
        }
        
        // 分析关系类型分布
        const typeCounts = {};
        relationships.forEach(rel => {
            typeCounts[rel.type] = (typeCounts[rel.type] || 0) + 1;
        });
        
        const dominantType = Object.entries(typeCounts)
            .sort((a, b) => b[1] - a[1])[0];
        
        if (dominantType) {
            const typeInfo = this.relationshipTypes[dominantType[0]] || this.relationshipTypes.other;
            insights.push(`<p><strong>Primary Relationship Type:</strong> ${typeInfo.label} (${dominantType[1]} connections) - This suggests ${character.name} primarily forms ${typeInfo.label.toLowerCase()} relationships.</p>`);
        }
        
        // 分析关系数量
        if (relationships.length <= 2) {
            insights.push('<p><strong>Social Circle:</strong> This character has a small, intimate social circle with few close connections.</p>');
        } else if (relationships.length <= 5) {
            insights.push('<p><strong>Social Circle:</strong> This character has a moderate social network with balanced connections.</p>');
        } else {
            insights.push('<p><strong>Social Circle:</strong> This character has a large social network with many connections.</p>');
        }
        
        // 分析关系多样性
        const uniqueTypes = Object.keys(typeCounts).length;
        if (uniqueTypes === 1) {
            insights.push('<p><strong>Relationship Diversity:</strong> This character tends to form similar types of relationships, suggesting a focused social approach.</p>');
        } else if (uniqueTypes <= 3) {
            insights.push('<p><strong>Relationship Diversity:</strong> This character has a varied social life with different types of connections.</p>');
        } else {
            insights.push('<p><strong>Relationship Diversity:</strong> This character has a highly diverse social network with many different relationship types.</p>');
        }
        
        // 分析是否有复杂关系
        const hasComplexRelationships = relationships.some(rel => rel.notes && rel.notes.length > 20);
        if (hasComplexRelationships) {
            insights.push('<p><strong>Relationship Complexity:</strong> Some relationships have detailed notes, indicating complex or nuanced connections.</p>');
        }
        
        return insights.join('');
    }
    
    // 生成AI友好的关系数据
    generateAIRelationshipData(character) {
        if (!character || !character.relationships) {
            return null;
        }
        
        const relationships = character.relationships.map(rel => ({
            target: rel.target,
            type: rel.type,
            typeLabel: this.relationshipTypes[rel.type]?.label || 'Other',
            notes: rel.notes || '',
            complexity: rel.notes ? rel.notes.length : 0
        }));
        
        // 按类型分组
        const relationshipsByType = {};
        relationships.forEach(rel => {
            if (!relationshipsByType[rel.type]) {
                relationshipsByType[rel.type] = [];
            }
            relationshipsByType[rel.type].push(rel);
        });
        
        return {
            characterName: character.name,
            totalRelationships: relationships.length,
            relationshipTypes: Object.keys(relationshipsByType),
            relationshipsByType: relationshipsByType,
            dominantRelationshipType: this.getDominantRelationshipType(relationships),
            relationshipSummary: this.generateRelationshipSummary(character)
        };
    }
    
    // 获取主导关系类型
    getDominantRelationshipType(relationships) {
        const typeCounts = {};
        relationships.forEach(rel => {
            typeCounts[rel.type] = (typeCounts[rel.type] || 0) + 1;
        });
        
        const dominant = Object.entries(typeCounts)
            .sort((a, b) => b[1] - a[1])[0];
        
        return dominant ? {
            type: dominant[0],
            label: this.relationshipTypes[dominant[0]]?.label || 'Other',
            count: dominant[1]
        } : null;
    }
    
    // 生成关系总结
    generateRelationshipSummary(character) {
        const relationships = character.relationships;
        if (relationships.length === 0) {
            return 'No relationships defined.';
        }
        
        const dominantType = this.getDominantRelationshipType(relationships);
        const totalConnections = relationships.length;
        
        let summary = `${character.name} has ${totalConnections} relationship${totalConnections > 1 ? 's' : ''}. `;
        
        if (dominantType) {
            summary += `The primary relationship type is ${dominantType.label.toLowerCase()} (${dominantType.count} connection${dominantType.count > 1 ? 's' : ''}). `;
        }
        
        if (totalConnections <= 2) {
            summary += 'This suggests a focused, intimate social circle.';
        } else if (totalConnections <= 5) {
            summary += 'This indicates a balanced social network.';
        } else {
            summary += 'This shows a broad, extensive social network.';
        }
        
        return summary;
    }
    
    // 分析关系网络模式
    analyzeRelationshipPatterns(characters) {
        if (!characters || characters.length < 2) {
            return null;
        }
        
        const analysis = {
            totalCharacters: characters.length,
            totalRelationships: 0,
            relationshipTypes: {},
            mutualRelationships: [],
            isolatedCharacters: [],
            networkDensity: 0
        };
        
        // 统计总体关系
        characters.forEach(character => {
            if (character.relationships) {
                analysis.totalRelationships += character.relationships.length;
                
                character.relationships.forEach(rel => {
                    if (!analysis.relationshipTypes[rel.type]) {
                        analysis.relationshipTypes[rel.type] = 0;
                    }
                    analysis.relationshipTypes[rel.type]++;
                });
            }
        });
        
        // 找出相互关系
        characters.forEach(character => {
            if (character.relationships) {
                character.relationships.forEach(rel => {
                    const targetCharacter = characters.find(c => c.name === rel.target);
                    if (targetCharacter && targetCharacter.relationships) {
                        const mutualRel = targetCharacter.relationships.find(r => r.target === character.name);
                        if (mutualRel) {
                            analysis.mutualRelationships.push({
                                character1: character.name,
                                character2: rel.target,
                                type1: rel.type,
                                type2: mutualRel.type
                            });
                        }
                    }
                });
            }
        });
        
        // 找出孤立角色
        analysis.isolatedCharacters = characters.filter(character => 
            !character.relationships || character.relationships.length === 0
        ).map(c => c.name);
        
        // 计算网络密度
        const maxPossibleRelationships = characters.length * (characters.length - 1);
        analysis.networkDensity = maxPossibleRelationships > 0 ? 
            (analysis.totalRelationships / maxPossibleRelationships).toFixed(3) : 0;
        
        return analysis;
    }
    
    // 生成关系网络报告
    generateNetworkReport(characters) {
        const analysis = this.analyzeRelationshipPatterns(characters);
        if (!analysis) {
            return 'Insufficient data for network analysis.';
        }
        
        let report = '## Relationship Network Analysis\n\n';
        
        report += `**Network Overview:**\n`;
        report += `- Total Characters: ${analysis.totalCharacters}\n`;
        report += `- Total Relationships: ${analysis.totalRelationships}\n`;
        report += `- Network Density: ${analysis.networkDensity}\n\n`;
        
        report += `**Relationship Type Distribution:**\n`;
        Object.entries(analysis.relationshipTypes).forEach(([type, count]) => {
            const typeInfo = this.relationshipTypes[type] || this.relationshipTypes.other;
            const percentage = ((count / analysis.totalRelationships) * 100).toFixed(1);
            report += `- ${typeInfo.label}: ${count} (${percentage}%)\n`;
        });
        
        if (analysis.mutualRelationships.length > 0) {
            report += `\n**Mutual Relationships:**\n`;
            analysis.mutualRelationships.forEach(mutual => {
                report += `- ${mutual.character1} ↔ ${mutual.character2} (${mutual.type1}/${mutual.type2})\n`;
            });
        }
        
        if (analysis.isolatedCharacters.length > 0) {
            report += `\n**Isolated Characters:**\n`;
            analysis.isolatedCharacters.forEach(name => {
                report += `- ${name}\n`;
            });
        }
        
        report += `\n**Network Insights:**\n`;
        if (analysis.networkDensity >= 0.5) {
            report += `- This is a dense network with many interconnected relationships.\n`;
        } else if (analysis.networkDensity >= 0.2) {
            report += `- This is a moderately connected network.\n`;
        } else {
            report += `- This is a sparse network with few connections.\n`;
        }
        
        return report;
    }
} 