export class Button extends Phaser.GameObjects.Container {
    constructor(scene, x, y, config = {}) {
        super(scene, x, y);
        
        const {
            width,
            height,
            backgroundColor = 0x4a90e2,
            normal = null,
            hover = null,
            pressed = null,
            text = '',
            textStyle = {},
            hoverTint = 0x357abd,
            pressedTint = 0x2868a9,
            onClick = () => {},
            padding = 20,  // 文本周围的内边距
            sizeMode = 'auto' // 'auto', 'fixed', 'scale'
        } = config;

        // 默认文本样式
        const defaultTextStyle = {
            fontFamily: 'Arial',
            fontSize: '20px',
            color: '#ffffff',
            align: 'center'
        };

        // 合并文本样式
        const finalTextStyle = { ...defaultTextStyle, ...textStyle };

        // 如果有文本，先创建文本对象来计算尺寸
        let textWidth = 0;
        let textHeight = 0;
        if (text) {
            this.text = scene.add.text(0, 0, text, finalTextStyle);
            this.text.setOrigin(0.5);
            textWidth = this.text.width + padding * 2;
            textHeight = this.text.height + padding * 2;
        }

        // 确定按钮最终尺寸
        let finalWidth = width;
        let finalHeight = height;
        
        if (sizeMode === 'auto') {
            // 自动模式：根据内容（文本或图片）决定大小
            if (normal) {
                // 临时创建图片以获取原始尺寸
                const tempImage = scene.textures.get(normal).getSourceImage();
                finalWidth = width || tempImage.width;
                finalHeight = height || tempImage.height;
            }
            // 确保按钮足够大以容纳文本
            if (text) {
                finalWidth = Math.max(finalWidth || 0, textWidth);
                finalHeight = Math.max(finalHeight || 0, textHeight);
            }
            // 如果没有指定任何尺寸，使用默认值
            finalWidth = finalWidth || 100;
            finalHeight = finalHeight || 40;
        } else {
            // fixed 模式：使用指定尺寸
            finalWidth = width || 100;
            finalHeight = height || 40;
        }

        // 创建背景
        if (normal) {
            // 使用图片按钮
            this.background = scene.add.image(0, 0, normal);
            if (sizeMode === 'scale') {
                // scale模式：保持图片比例
                const scaleX = finalWidth / this.background.width;
                const scaleY = finalHeight / this.background.height;
                const scale = Math.min(scaleX, scaleY);
                this.background.setScale(scale);
            } else {
                // 其他模式：拉伸适应
                this.background.setDisplaySize(finalWidth, finalHeight);
            }
            
            // 存储图片键值
            this.normalKey = normal;
            this.hoverKey = hover || normal;
            this.pressedKey = pressed || normal;
            this.isImageButton = true;
        } else {
            // 使用矩形按钮
            this.background = scene.add.rectangle(0, 0, finalWidth, finalHeight, backgroundColor);
            this.isImageButton = false;
        }

        // 添加到容器
        this.add(this.background);

        // 添加文本（如果有）
        if (this.text) {
            this.add(this.text);
        }

        // 设置交互
        this.background.setInteractive({ useHandCursor: true });
        
        // 交互事件
        this.background.on('pointerover', () => {
            if (this.isImageButton) {
                this.background.setTexture(this.hoverKey);
            } else {
                this.background.setFillStyle(hoverTint);
            }
        });

        this.background.on('pointerout', () => {
            if (this.isImageButton) {
                this.background.setTexture(this.normalKey);
            } else {
                this.background.setFillStyle(backgroundColor);
            }
        });

        this.background.on('pointerdown', () => {
            if (this.isImageButton) {
                this.background.setTexture(this.pressedKey);
            } else {
                this.background.setFillStyle(pressedTint);
            }
        });

        this.background.on('pointerup', () => {
            if (this.isImageButton) {
                this.background.setTexture(this.hoverKey);
            } else {
                this.background.setFillStyle(hoverTint);
            }
            onClick();
        });

        // 添加到场景
        scene.add.existing(this);
    }

    setText(text) {
        if (!this.text && text) {
            // 如果之前没有文本对象但现在需要显示文本，创建新的文本对象
            this.text = this.scene.add.text(0, 0, text, {
                fontFamily: 'Arial',
                fontSize: '20px',
                color: '#ffffff',
                align: 'center'
            });
            this.text.setOrigin(0.5);
            this.add(this.text);
        } else if (this.text) {
            // 如果已有文本对象，更新文本
            this.text.setText(text);
        }
    }

    setTextStyle(style) {
        if (this.text) {
            this.text.setStyle(style);
        }
    }

    setBackgroundColor(color) {
        if (!this.isImageButton && this.background instanceof Phaser.GameObjects.Rectangle) {
            this.background.setFillStyle(color);
        }
    }

    setEnabled(enabled) {
        this.background.setInteractive(enabled);
        if (!enabled) {
            if (this.isImageButton) {
                this.background.setTint(0x666666);
            } else {
                this.background.setFillStyle(0x666666);
            }
            if (this.text) {
                this.text.setAlpha(0.5);
            }
        } else {
            if (this.isImageButton) {
                this.background.clearTint();
                this.background.setTexture(this.normalKey);
            } else {
                this.background.setFillStyle(0x4a90e2);
            }
            if (this.text) {
                this.text.setAlpha(1);
            }
        }
    }
}
