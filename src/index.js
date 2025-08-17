import './styles.css';
import { CharacterTracker } from './CharacterTracker';
import { PersonalityAnalyzer } from './PersonalityAnalyzer';
import { RelationshipNetwork } from './RelationshipNetwork';

// Silly Tavern插件注册
(function() {
    'use strict';
    
    // 等待Silly Tavern加载完成
    const hook = () => {
        if (window.CharacterTrackerPlugin) {
            return;
        }
        
        // 创建插件实例
        window.CharacterTrackerPlugin = {
            characterTracker: new CharacterTracker(),
            personalityAnalyzer: new PersonalityAnalyzer(),
            relationshipNetwork: new RelationshipNetwork(),
            
            // 初始化插件
            init: function() {
                this.characterTracker.init();
                this.personalityAnalyzer.init();
                this.relationshipNetwork.init();
                this.addMenuButton();
                console.log('Character Tracker Plugin initialized');
            },
            
            // 添加菜单按钮
            addMenuButton: function() {
                // 等待菜单加载完成
                const checkMenu = setInterval(() => {
                    const menu = document.querySelector('#menu');
                    if (menu) {
                        clearInterval(checkMenu);
                        
                        const button = document.createElement('button');
                        button.innerHTML = '👥 Character Tracker';
                        button.className = 'menu_button';
                        button.onclick = () => this.openMainInterface();
                        
                        menu.appendChild(button);
                    }
                }, 1000);
            },
            
            // 打开主界面
            openMainInterface: function() {
                this.characterTracker.showInterface();
            }
        };
        
        // 自动初始化
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => {
                window.CharacterTrackerPlugin.init();
            });
        } else {
            window.CharacterTrackerPlugin.init();
        }
    };
    
    // 检查是否已经加载
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', hook);
    } else {
        hook();
    }
})(); 