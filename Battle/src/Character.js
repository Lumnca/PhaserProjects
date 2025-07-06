import { CharacterData } from './CharacterData.js';

export class Character extends Phaser.GameObjects.Sprite {
    constructor(scene, characterData) {
        // 检查characterData是否是有效的CharacterData实例
        if (!characterData || typeof characterData.getHealthPercentage !== 'function') {
            throw new Error('Character constructor requires a valid CharacterData instance');
        }
        
        super(scene, characterData.x, characterData.y, characterData.characterKey);
        
        this.scene = scene;
        this.characterData = characterData;
        this.characterKey = characterData.characterKey;
        
        // 设置统一的显示尺寸和锚点
        this.setDisplaySize(128, 126); // 使用最大尺寸作为显示尺寸
        this.setOrigin(0.5, 1); // 设置锚点在底部中心，这样角色会站在地面上
        
        // 添加到场景
        this.scene.add.existing(this);
        
        // 创建血条UI
        this.createHealthBar();
        
        // 初始化动画
        this.createAnimations();
        
        // 设置默认动画
        this.play('idle');
    }
    
    // 创建血条UI
    createHealthBar() {
        // 血条背景（灰色）
        this.healthBarBg = this.scene.add.rectangle(
            this.x, 
            this.y - this.displayHeight - 8, 
            20, 
            5, 
            0x333333
        ).setOrigin(0.5);
        
        // 血条前景（绿色）
        this.healthBar = this.scene.add.rectangle(
            this.x, 
            this.y - this.displayHeight - 8, 
            20, 
            5, 
            0x00ff00
        ).setOrigin(0.5);
        
        // 血条边框（黑色）
        this.healthBarBorder = this.scene.add.rectangle(
            this.x, 
            this.y - this.displayHeight - 8, 
            20, 
            5, 
            0x000000,
            0
        ).setStrokeStyle(1, 0x000000).setOrigin(0.5);
        
        // 将血条添加到场景的UI层（如果存在）或者直接添加到场景
        this.scene.add.existing(this.healthBarBg);
        this.scene.add.existing(this.healthBar);
        this.scene.add.existing(this.healthBarBorder);
        
        // 设置血条的深度，确保显示在角色上方
        this.healthBarBg.setDepth(1000);
        this.healthBar.setDepth(1001);
        this.healthBarBorder.setDepth(1002);
        
        // 初始化血条
        this.updateHealthBar();
    }
    
    // 更新血条显示
    updateHealthBar() {
        if (!this.healthBar || !this.healthBarBg || !this.healthBarBorder) return;
        
        // 检查characterData是否有效
        if (!this.characterData || typeof this.characterData.getHealthPercentage !== 'function') {
            console.error('Invalid characterData in updateHealthBar');
            return;
        }
        
        const healthPercentage = this.characterData.getHealthPercentage();
        const maxWidth = 20;
        const currentWidth = (healthPercentage / 100) * maxWidth;
        
        // 更新血条宽度
        this.healthBar.width = currentWidth;
        
        // 根据血量百分比改变颜色
        if (healthPercentage > 60) {
            this.healthBar.fillColor = 0x00ff00; // 绿色
        } else if (healthPercentage > 30) {
            this.healthBar.fillColor = 0xffff00; // 黄色
        } else {
            this.healthBar.fillColor = 0xff0000; // 红色
        }
        
        // 更新血条位置（跟随角色）
        const barY = this.y - this.displayHeight - 8;
        this.healthBarBg.setPosition(this.x, barY);
        this.healthBar.setPosition(this.x, barY);
        this.healthBarBorder.setPosition(this.x, barY);
    }
    
    // 销毁血条
    destroyHealthBar() {
        if (this.healthBar) {
            this.healthBar.destroy();
            this.healthBar = null;
        }
        if (this.healthBarBg) {
            this.healthBarBg.destroy();
            this.healthBarBg = null;
        }
        if (this.healthBarBorder) {
            this.healthBarBorder.destroy();
            this.healthBarBorder = null;
        }
    }
    
    createAnimations() {
        // 静止动画 - 使用单张图片
        this.scene.anims.create({
            key: `${this.characterKey}_idle`,
            frames: [{ key: this.characterKey, frame: 0 }],
            frameRate: 1,
            duration: 1000,
            repeat: -1
        });
        
        // 移动动画 - 使用move帧序列
        const moveFrames = [];
        for (let i = 0; i <= 7; i++) {
            const frameNumber = i.toString().padStart(5, '0');
            moveFrames.push({
                key: `${this.characterKey}_move_${frameNumber}`,
                frame: 0
            });
        }
        
        this.scene.anims.create({
            key: `${this.characterKey}_move`,
            frames: moveFrames,
            frameRate: 12,
            duration: 1000,
            repeat: -1
        });
        
        // 攻击动画 - 使用attack帧序列，设置统一的显示尺寸
        const attackFrames = [];
        for (let i = 0; i <= 2; i++) {
            attackFrames.push({
                key: `${this.characterKey}_att_${i.toString().padStart(5, '0')}`,
                frame: 0
            });
        }
        
        this.scene.anims.create({
            key: `${this.characterKey}_attack`,
            frames: attackFrames,
            frameRate: 8,
            duration: 500,
            repeat: 0
        });
        
        // 存储动画引用
        this.animations = {
            idle: `${this.characterKey}_idle`,
            move: `${this.characterKey}_move`,
            attack: `${this.characterKey}_attack`
        };
    }
    
    static preload(scene, characterKey) {
        // 加载静止图片
        scene.load.image(characterKey, `assets/battle/${characterKey}/${characterKey}.png`);
        
        // 加载移动帧序列
        for (let i = 0; i <= 7; i++) {
            const frameNumber = i.toString().padStart(5, '0');
            scene.load.image(
                `${characterKey}_move_${frameNumber}`,
                `assets/battle/${characterKey}/${characterKey}_move_${frameNumber}.png`
            );
        }
        
        // 加载攻击帧序列
        for (let i = 0; i <= 2; i++) {
            const frameNumber = i.toString().padStart(5, '0');
            scene.load.image(
                `${characterKey}_att_${frameNumber}`,
                `assets/battle/${characterKey}/${characterKey}_att_${frameNumber}.png`
            );
        }
    }
    
    // 重写play方法，确保所有动画都使用统一的显示尺寸
    play(key, ignoreIfPlaying = false, startFrame = 0) {
        super.play(key, ignoreIfPlaying, startFrame);
        
        // 确保所有动画帧都使用统一的显示尺寸
        this.setDisplaySize(32, 48);
        this.setOrigin(0.5, 1);
    }
    
    // 更新渲染状态
    updateRender() {
        // 更新位置
        this.x = this.characterData.x;
        this.y = this.characterData.y;
        
        // 更新面向
        this.setFlipX(!this.characterData.facingRight);
        
        // 更新动画状态
        if (this.characterData.isAttacking) {
            this.play(this.animations.attack, true);
        } else if (this.characterData.isMoving) {
            this.play(this.animations.move, true);
        } else {
            this.play(this.animations.idle, true);
        }
        
        // 更新血条
        this.updateHealthBar();
    }
    
    // 播放受伤闪烁效果
    playHitEffect() {
        // 创建闪烁效果
        this.scene.tweens.add({
            targets: this,
            alpha: 0.3,
            duration: 100,
            yoyo: true,
            repeat: 2,
            onComplete: () => {
                this.setAlpha(1);
            }
        });
        
        // 添加红色闪烁效果
        const originalTint = this.tint;
        this.setTint(0xff0000);
        
        this.scene.time.delayedCall(300, () => {
            this.clearTint();
        });
    }
    
    // 显示伤害数字
    showDamageNumber(x, y, damage) {
        const damageText = this.scene.add.text(x, y - 50, damage.toString(), {
            fontSize: '16px',
            fill: '#ff0000',
            stroke: '#000',
            strokeThickness: 2
        }).setOrigin(0.5);
        
        // 伤害数字动画
        this.scene.tweens.add({
            targets: damageText,
            y: y - 100,
            alpha: 0,
            duration: 1000,
            onComplete: () => {
                damageText.destroy();
            }
        });
    }
    
    // 重写destroy方法，确保血条被正确清理
    destroy() {
        this.destroyHealthBar();
        super.destroy();
    }
    
    // 获取角色数据
    getCharacterData() {
        return this.characterData;
    }
    
    // 检查是否存活
    isAlive() {
        return this.characterData.isAlive();
    }
    
    // 获取血量百分比
    getHealthPercentage() {
        return this.characterData.getHealthPercentage();
    }
    
    // 获取当前状态
    getState() {
        return this.characterData.getState();
    }
} 