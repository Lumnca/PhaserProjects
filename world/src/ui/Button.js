export class Button extends Phaser.GameObjects.Container {
    /**
     * @param {Phaser.Scene} scene - 所在场景
     * @param {number} x - 按钮中心x
     * @param {number} y - 按钮中心y
     * @param {string} text - 按钮文本
     * @param {object} options - 可选项: { iconKey, width, height, onClick }
     */
    constructor(scene, x, y, text, options = {}) {
        super(scene, x, y);
        this.scene = scene;
        this.options = options;
        // 文本样式
        const textStyle = {
            fontSize: '32px',
            color: '#fff',
            fontFamily: 'Arial',
            stroke: '#000',
            strokeThickness: 4
        };
        // 先创建文本对象用于测量宽度
        const tempText = scene.add.text(0, 0, text, textStyle).setOrigin(0.5);
        const padding = 48;
        const minWidth = options.width || 200;
        const minHeight = options.height || 80;
        const bgWidth = Math.max(tempText.width + padding, minWidth);
        const bgHeight = Math.max(tempText.height + 24, minHeight);
        tempText.destroy();
        // 加载背景，四边拉伸 20px
        this.bg = scene.add.nineslice(0, 0, bgWidth, bgHeight, 'button1', undefined, 20, 20, 20, 20);
        this.bg.setOrigin(0.5);
        this.add(this.bg);
        // 图标
        if (options.iconKey) {
            this.icon = scene.add.image(-bgWidth/2+40, 0, options.iconKey).setScale(0.5).setOrigin(0.5);
            this.add(this.icon);
        }
        // 文本
        this.label = scene.add.text(0, 0, text, textStyle).setOrigin(0.5);
        this.add(this.label);
        // 交互
        this.setSize(bgWidth, bgHeight);
        this.setInteractive({ useHandCursor: true })
            .on('pointerdown', () => {
                this.bg.setTint(0xaaaaaa);
                if (options.onClick) options.onClick();
            })
            .on('pointerup', () => {
                this.bg.clearTint();
            })
            .on('pointerout', () => {
                this.bg.clearTint();
            });
        scene.add.existing(this);
    }
}
