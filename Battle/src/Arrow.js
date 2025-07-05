export class Arrow extends Phaser.GameObjects.Sprite {
    constructor(scene, startX, startY, targetX, targetY, damage = 25, shooterFaction = 'archer', targetCharacter = null) {
        super(scene, startX, startY, 'arrow');
        
        this.scene = scene;
        this.startX = startX;
        this.startY = startY;
        this.targetX = targetX;
        this.targetY = targetY;
        this.damage = damage; // 弓箭伤害
        this.shooterFaction = shooterFaction; // 射手阵营
        this.targetCharacter = targetCharacter; // 目标角色
        
        // 弓箭属性
        this.speed = 300; // 弓箭速度
        this.arcHeight = 100; // 弧形高度
        this.distance = Phaser.Math.Distance.Between(startX, startY, targetX, targetY);
        this.travelTime = this.distance / this.speed; // 飞行时间
        this.currentTime = 0;
        
        // 计算角度
        this.angle = Phaser.Math.Angle.Between(startX, startY, targetX, targetY);
        this.setRotation(this.angle);
        
        // 设置显示属性
        this.setDisplaySize(16, 8); // 弓箭大小
        this.setOrigin(0.5, 0.5);
        
        // 添加到场景
        this.scene.add.existing(this);
        
        // 设置生命周期
        this.lifeTime = this.travelTime * 1000; // 转换为毫秒
        this.startTime = scene.time.now;
        
        // 攻击状态
        this.hasDealtDamage = false; // 防止重复造成伤害
    }
    
    // 造成伤害
    dealDamage() {
        if (this.hasDealtDamage || !this.targetCharacter || !this.targetCharacter.isAlive()) return;
        
        this.hasDealtDamage = true;
        
        // 造成伤害
        const actualDamage = this.targetCharacter.takeDamage(this.damage);
        
        // 显示伤害数字
        this.showDamageNumber(this.targetCharacter.x, this.targetCharacter.y, actualDamage);
    }
    
    // 显示伤害数字
    showDamageNumber(x, y, damage) {
        if (!this.scene) return;
        
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
                if (damageText.active) {
                    damageText.destroy();
                }
            }
        });
    }
    
    update(deltaTime) {
        // 检查是否已被销毁
        if (!this.active || !this.scene) {
            return;
        }
        
        this.currentTime += deltaTime / 1000; // 转换为秒
        
        if (this.currentTime >= this.travelTime) {
            // 弓箭到达目标点，造成伤害并销毁
            this.dealDamage();
            this.destroy();
            return;
        }
        
        // 计算当前位置（弧形轨迹）
        const progress = this.currentTime / this.travelTime;
        
        // 线性插值计算X和Y位置
        const currentX = Phaser.Math.Linear(this.startX, this.targetX, progress);
        const currentY = Phaser.Math.Linear(this.startY, this.targetY, progress);
        
        // 添加弧形效果（抛物线）
        const arcOffset = Math.sin(progress * Math.PI) * this.arcHeight;
        const finalY = currentY - arcOffset;
        
        // 更新位置
        this.setPosition(currentX, finalY);
        
        // 计算当前移动方向的角度
        const prevX = progress > 0.01 ? Phaser.Math.Linear(this.startX, this.targetX, progress - 0.01) : this.startX;
        const prevY = progress > 0.01 ? Phaser.Math.Linear(this.startY, this.targetY, progress - 0.01) - Math.sin((progress - 0.01) * Math.PI) * this.arcHeight : this.startY;
        
        const velocityX = currentX - prevX;
        const velocityY = finalY - prevY;
        const currentAngle = Math.atan2(velocityY, velocityX);
        
        // 更新旋转角度（让弓箭始终指向移动方向）
        this.setRotation(currentAngle);
        
        // 检查生命周期（使用更安全的方式）
        if (this.scene && this.scene.time && this.scene.time.now - this.startTime > this.lifeTime) {
            this.dealDamage();
            this.destroy();
        }
    }
    
    // 静态方法：预加载弓箭资源
    static preload(scene) {
        scene.load.image('arrow', 'assets/battle/archer/arrow.png');
    }
} 