import { Label } from '../components/Label.js';
import { Icon } from '../components/Icon.js';
import { Button } from '../components/Button.js';

export class Slave extends Phaser.Scene {

    constructor() {
        super('Slave');
        this.attributes = [
            { label: '姓名', value: '艾莉丝' },
            { label: '等级', value: '25' },
            { label: '生命值', value: '2500/2500', icon: { row: 0, col: 0 } },
            { label: '魔法值', value: '1200/1200', icon: { row: 0, col: 1 } },
            { label: '力量', value: '45', icon: { row: 0, col: 1 } },
            { label: '敏捷', value: '38', icon: { row: 0, col: 1 } },
            { label: '智力', value: '65', icon: { row: 0, col: 1 } },
            { label: '体质', value: '42', icon: { row: 0, col: 1 } },
            { label: '物理攻击', value: '156', icon: { row: 0, col: 6 } },
            { label: '魔法攻击', value: '189', icon: { row: 0, col: 7 } },
            { label: '物理防御', value: '85', icon: { row: 0, col: 8 } },
            { label: '魔法防御', value: '92', icon: { row: 0, col: 9 } },
            { label: '暴击率', value: '15%', icon: { row: 0, col: 10 } },
            { label: '闪避率', value: '8%', icon: { row: 0, col: 11 } },
            { label: '命中率', value: '95%', icon: { row: 0, col: 12 } },
            { label: '经验值', value: '12500/15000', icon: { row: 0, col: 13 } },
            { label: '技能点', value: '3', icon: { row: 0, col: 14 } },
            { label: '属性点', value: '5', icon: { row: 0, col: 15 } },
            { label: '声望值', value: '2500', icon: { row: 1, col: 0 } },
            { label: '金币', value: '15000', icon: { row: 1, col: 1 } }
        ];
    }

    preload() {
        this.load.image('character', 'assets/a1.png');
        this.load.image('button_bg', 'assets/button_bg.png');
        
        // 加载图标集为 sprite sheet
        this.load.spritesheet('iconSet', 'assets/icon/iconSet.png', {
            frameWidth: 32,
            frameHeight: 32
        });
    }

    create() {
        const gameWidth = this.cameras.main.width;
        const gameHeight = this.cameras.main.height;
        
        // 设置布局常量
        const padding = 20;
        const rightWidth = 520;  // 右侧区域宽度
        const leftWidth = gameWidth - rightWidth;  // 左侧区域宽度
        
        const attributeStartY = padding;
        const attributeSpacing = 30;
        const iconTextGap = 10;  // 图标和文本之间的间距

        // 创建属性标签和图标
        this.attributes.forEach((attr, index) => {
            const y = attributeStartY + (index * attributeSpacing);
            
             // 如果有图标配置，先创建图标
             if (attr.icon) {
                const fontSize = 18;  // 与文本大小匹配
                const iconScale = fontSize / Icon.ICON_SIZE;  // 根据文本大小缩放图标
                
                new Icon(this, padding + Icon.ICON_SIZE/2, y + fontSize/2, {
                    row: attr.icon.row,
                    col: attr.icon.col,
                    scale: iconScale
                });
            }


            // 创建文本标签（考虑图标宽度和间距）
            const labelX = attr.icon ? padding + Icon.ICON_SIZE + iconTextGap : padding;
            new Label(this, labelX, y, `${attr.label}: ${attr.value}`, {
                fontSize: '18px',
                color: '#ffffff'
            });
        });

        // 创建右侧立绘
        const characterX = leftWidth + (rightWidth / 2);
        const characterY = gameHeight / 2;
        const character = this.add.sprite(characterX, characterY, 'character');
        
        // 计算缩放比例，确保图片适应屏幕高度
        const maxHeight = gameHeight - (padding * 2); // 留出上下边距
        const scale = Math.min(
            rightWidth / character.width,
            maxHeight / character.height
        );
        character.setScale(scale);

        // 创建底部按钮
        const buttonSpacing = 20;  // 按钮之间的间距
        const buttonWidth = 100;   // 按钮宽度
        const buttonHeight = 40;   // 按钮高度
        const buttonY = gameHeight - padding - buttonHeight;
        
        // 计算第一个按钮的起始X坐标，确保所有按钮都在可视区域内
        const totalButtonsWidth = (buttonWidth * 3) + (buttonSpacing * 2);  // 3个按钮的总宽度加间距
        const buttonsStartX = padding;  // 从左边距开始

        const buttons = [
            { text: '升级', x: buttonsStartX },
            { text: '技能', x: buttonsStartX + buttonWidth + buttonSpacing },
            { text: '装备', x: buttonsStartX + (buttonWidth + buttonSpacing) * 2 }
        ];

        buttons.forEach(btn => {
            new Button(this, btn.x + buttonWidth/2, buttonY, {
                text: btn.text,
                width: buttonWidth,
                height: buttonHeight,
                onClick: () => {
                    console.log(`${btn.text} clicked`);
                },
                textStyle: {
                    fontSize: '20px',
                    color: '#ffffff'
                }
            });
        });
    }

    update() {
        
    }
}
