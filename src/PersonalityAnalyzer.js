export class PersonalityAnalyzer {
    constructor() {
        this.chartColors = [
            '#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF',
            '#FF9F40', '#FF6384', '#C9CBCF', '#4BC0C0', '#FF6384'
        ];
    }
    
    init() {
        // 初始化Chart.js
        this.loadChartJS();
    }
    
    // 动态加载Chart.js
    loadChartJS() {
        if (window.Chart) {
            return;
        }
        
        const script = document.createElement('script');
        script.src = 'https://cdn.jsdelivr.net/npm/chart.js@4.4.0/dist/chart.umd.js';
        script.onload = () => {
            console.log('Chart.js loaded successfully');
        };
        script.onerror = () => {
            console.error('Failed to load Chart.js');
        };
        document.head.appendChild(script);
    }
    
    // 生成性格饼图
    generatePersonalityChart(character, container) {
        if (!character || !character.personalityTraits || character.personalityTraits.length === 0) {
            container.innerHTML = '<p>No personality traits to display.</p>';
            return;
        }
        
        // 等待Chart.js加载完成
        const checkChart = setInterval(() => {
            if (window.Chart) {
                clearInterval(checkChart);
                this.createChart(character, container);
            }
        }, 100);
    }
    
    // 创建图表
    createChart(character, container) {
        // 清除容器
        container.innerHTML = '';
        
        // 准备数据
        const labels = character.personalityTraits.map(trait => trait.name);
        const data = character.personalityTraits.map(trait => trait.weight);
        const colors = this.chartColors.slice(0, labels.length);
        
        // 创建画布
        const canvas = document.createElement('canvas');
        canvas.id = `personality-chart-${character.name.replace(/\s+/g, '-')}`;
        canvas.width = 400;
        canvas.height = 400;
        
        container.appendChild(canvas);
        
        // 创建图表
        const ctx = canvas.getContext('2d');
        const chart = new Chart(ctx, {
            type: 'pie',
            data: {
                labels: labels,
                datasets: [{
                    data: data,
                    backgroundColor: colors,
                    borderColor: '#fff',
                    borderWidth: 2
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    title: {
                        display: true,
                        text: `${character.name}'s Personality Traits`,
                        font: {
                            size: 16
                        }
                    },
                    legend: {
                        position: 'right',
                        labels: {
                            padding: 20,
                            usePointStyle: true
                        }
                    },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                const label = context.label || '';
                                const value = context.parsed || 0;
                                const total = context.dataset.data.reduce((a, b) => a + b, 0);
                                const percentage = ((value / total) * 100).toFixed(1);
                                return `${label}: ${value}/10 (${percentage}%)`;
                            }
                        }
                    }
                }
            }
        });
        
        // 添加统计信息
        this.addPersonalityStats(character, container, chart);
    }
    
    // 添加性格统计信息
    addPersonalityStats(character, container, chart) {
        const statsContainer = document.createElement('div');
        statsContainer.className = 'ct-personality-stats';
        
        const totalWeight = character.personalityTraits.reduce((sum, trait) => sum + trait.weight, 0);
        const averageWeight = (totalWeight / character.personalityTraits.length).toFixed(1);
        
        // 找出主导特征
        const dominantTraits = character.personalityTraits
            .sort((a, b) => b.weight - a.weight)
            .slice(0, 3);
        
        statsContainer.innerHTML = `
            <div class="ct-stats-grid">
                <div class="ct-stat-item">
                    <h4>Total Traits</h4>
                    <p>${character.personalityTraits.length}</p>
                </div>
                <div class="ct-stat-item">
                    <h4>Total Weight</h4>
                    <p>${totalWeight}/10</p>
                </div>
                <div class="ct-stat-item">
                    <h4>Average Weight</h4>
                    <p>${averageWeight}/10</p>
                </div>
            </div>
            
            <div class="ct-dominant-traits">
                <h4>Dominant Traits</h4>
                <div class="ct-trait-ranking">
                    ${dominantTraits.map((trait, index) => `
                        <div class="ct-trait-rank">
                            <span class="ct-rank-number">${index + 1}</span>
                            <span class="ct-trait-name">${trait.name}</span>
                            <span class="ct-trait-weight">${trait.weight}/10</span>
                        </div>
                    `).join('')}
                </div>
            </div>
            
            <div class="ct-personality-insights">
                <h4>Personality Insights</h4>
                <div class="ct-insights-content">
                    ${this.generatePersonalityInsights(character)}
                </div>
            </div>
        `;
        
        container.appendChild(statsContainer);
    }
    
    // 生成性格洞察
    generatePersonalityInsights(character) {
        const insights = [];
        const traits = character.personalityTraits;
        
        if (traits.length === 0) {
            return '<p>No personality traits defined.</p>';
        }
        
        // 分析特征强度分布
        const highTraits = traits.filter(t => t.weight >= 8);
        const mediumTraits = traits.filter(t => t.weight >= 5 && t.weight < 8);
        const lowTraits = traits.filter(t => t.weight < 5);
        
        if (highTraits.length > 0) {
            insights.push(`<p><strong>Strong Traits:</strong> ${highTraits.map(t => t.name).join(', ')} - These are defining characteristics that strongly influence behavior.</p>`);
        }
        
        if (mediumTraits.length > 0) {
            insights.push(`<p><strong>Moderate Traits:</strong> ${mediumTraits.map(t => t.name).join(', ')} - These traits provide balance and nuance to the character.</p>`);
        }
        
        if (lowTraits.length > 0) {
            insights.push(`<p><strong>Subtle Traits:</strong> ${lowTraits.map(t => t.name).join(', ')} - These are background characteristics that may emerge in specific situations.</p>`);
        }
        
        // 分析特征数量
        if (traits.length <= 3) {
            insights.push('<p><strong>Personality:</strong> This character has a focused, well-defined personality with clear dominant traits.</p>');
        } else if (traits.length <= 6) {
            insights.push('<p><strong>Personality:</strong> This character has a balanced personality with good depth and variety.</p>');
        } else {
            insights.push('<p><strong>Personality:</strong> This character has a complex personality with many facets and potential for growth.</p>');
        }
        
        // 分析权重分布
        const totalWeight = traits.reduce((sum, t) => sum + t.weight, 0);
        const averageWeight = totalWeight / traits.length;
        
        if (averageWeight >= 7) {
            insights.push('<p><strong>Intensity:</strong> This character has strong, pronounced personality traits.</p>');
        } else if (averageWeight >= 5) {
            insights.push('<p><strong>Intensity:</strong> This character has balanced personality traits with moderate intensity.</p>');
        } else {
            insights.push('<p><strong>Intensity:</strong> This character has subtle, understated personality traits.</p>');
        }
        
        return insights.join('');
    }
    
    // 生成AI友好的性格数据
    generateAIPersonalityData(character) {
        if (!character || !character.personalityTraits) {
            return null;
        }
        
        const traits = character.personalityTraits.map(trait => ({
            name: trait.name,
            weight: trait.weight,
            percentage: ((trait.weight / 10) * 100).toFixed(1)
        }));
        
        // 按权重排序
        traits.sort((a, b) => b.weight - a.weight);
        
        return {
            characterName: character.name,
            totalTraits: traits.length,
            dominantTrait: traits[0]?.name || 'None',
            traitBreakdown: traits,
            personalitySummary: this.generatePersonalitySummary(character)
        };
    }
    
    // 生成性格总结
    generatePersonalitySummary(character) {
        const traits = character.personalityTraits;
        if (traits.length === 0) {
            return 'No personality traits defined.';
        }
        
        const dominantTrait = traits.reduce((max, trait) => trait.weight > max.weight ? trait : max);
        const totalWeight = traits.reduce((sum, trait) => sum + trait.weight, 0);
        const averageWeight = totalWeight / traits.length;
        
        let summary = `${character.name} is primarily characterized by being ${dominantTrait.name} (${dominantTrait.weight}/10). `;
        
        if (averageWeight >= 7) {
            summary += 'Overall, this character has strong, well-defined personality traits. ';
        } else if (averageWeight >= 5) {
            summary += 'This character has a balanced personality with moderate trait intensity. ';
        } else {
            summary += 'This character has subtle, understated personality traits. ';
        }
        
        if (traits.length <= 3) {
            summary += 'The personality is focused and straightforward.';
        } else if (traits.length <= 6) {
            summary += 'The personality shows good depth and complexity.';
        } else {
            summary += 'The personality is complex and multifaceted.';
        }
        
        return summary;
    }
    
    // 比较多个角色的性格
    comparePersonalities(characters) {
        if (!characters || characters.length < 2) {
            return null;
        }
        
        const comparison = {
            totalCharacters: characters.length,
            traitFrequency: {},
            averageWeights: {},
            personalityOverlap: []
        };
        
        // 统计特征频率
        characters.forEach(character => {
            if (character.personalityTraits) {
                character.personalityTraits.forEach(trait => {
                    if (!comparison.traitFrequency[trait.name]) {
                        comparison.traitFrequency[trait.name] = 0;
                    }
                    comparison.traitFrequency[trait.name]++;
                });
            }
        });
        
        // 计算平均权重
        Object.keys(comparison.traitFrequency).forEach(traitName => {
            let totalWeight = 0;
            let count = 0;
            
            characters.forEach(character => {
                if (character.personalityTraits) {
                    const trait = character.personalityTraits.find(t => t.name === traitName);
                    if (trait) {
                        totalWeight += trait.weight;
                        count++;
                    }
                }
            });
            
            comparison.averageWeights[traitName] = count > 0 ? (totalWeight / count).toFixed(1) : 0;
        });
        
        // 找出共同特征
        comparison.personalityOverlap = Object.entries(comparison.traitFrequency)
            .filter(([trait, count]) => count > 1)
            .sort((a, b) => b[1] - a[1]);
        
        return comparison;
    }
} 