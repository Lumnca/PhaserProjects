export class Character extends Phaser.GameObjects.Sprite {
    constructor(scene, x, y, characterKey) {
        super(scene, x, y, characterKey);
        
        this.scene = scene;
        this.characterKey = characterKey;
        this.facingRight = true; // 默认面向右边
        this.isMoving = false;
        this.isAttacking = false;
        this.moveSpeed = 200;
        
        // 添加2D移动相关属性
        this.velocityX = 0;
        this.velocityY = 0;
        this.targetAngle = 0;
        
        // 弓箭手特殊属性
        this.isArcher = characterKey === 'archer';
        this.arrows = []; // 存储射出的弓箭
        
        // 阵营和战斗属性
        this.faction = characterKey === 'archer' ? 'archer' : 'barbar';
        this.attackRange = this.isArcher ? 250 : 30; // 攻击范围
        this.attackCooldown = 0; // 攻击冷却时间
        this.attackCooldownTime = this.isArcher ? 2000 : 1500; // 攻击冷却时间（毫秒）
        this.currentTarget = null; // 当前攻击目标
        
        // 寻敌和移动属性
        this.searchRange = 400; // 寻敌范围
        this.isSearching = false; // 是否正在寻敌
        
        // 角色属性系统
        this.initializeStats();
        
        // 动画状态
        this.animations = {};
        
        // 设置统一的显示尺寸和锚点
        this.setDisplaySize(128, 126); // 使用最大尺寸作为显示尺寸
        this.setOrigin(0.5, 1); // 设置锚点在底部中心，这样角色会站在地面上
        
        // 添加到场景
        this.scene.add.existing(this);
        
        // 初始化动画
        this.createAnimations();
        
        // 设置默认动画
        this.play('idle');
    }
    
    // 初始化角色属性
    initializeStats() {
        if (this.isArcher) {
            // 弓箭手属性（攻击力高，防御力低，血量中等）
            this.maxHP = 100;
            this.currentHP = 100;
            this.attack = 25;
            this.defense = 8;
            this.moveSpeed = Phaser.Math.Between(40, 90);
        } else {
            // 战士属性（攻击力中等，防御力高，血量高）
            this.maxHP = 120;
            this.currentHP = 120;
            this.attack = 20;
            this.defense = 5;
            this.moveSpeed = Phaser.Math.Between(30, 80);
        }
        
        // 设置移动速度
        this.setMoveSpeed(this.moveSpeed);
    }
    
    // 受到伤害
    takeDamage(damage) {
        // 计算实际伤害（考虑防御力）
        const actualDamage = Math.max(1, damage - this.defense);
        this.currentHP -= actualDamage;
        
        // 确保血量不为负数
        this.currentHP = Math.max(0, this.currentHP);
        
        // 播放受伤闪烁效果
        this.playHitEffect();
        
        // 如果血量归零，死亡
        if (this.currentHP <= 0) {
            this.die();
        }
        
        return actualDamage;
    }
    
    // 死亡处理
    die() {
        // 停止所有活动
        this.stop();
        this.isAttacking = false;
        this.currentTarget = null;
        
        // 销毁所有弓箭
        this.arrows.forEach(arrow => {
            if (arrow.active) {
                arrow.destroy();
            }
        });
        this.arrows = [];
        
        // 播放死亡动画（如果有的话，这里暂时使用淡出效果）
        this.scene.tweens.add({
            targets: this,
            alpha: 0,
            duration: 500,
            onComplete: () => {
                this.destroy();
            }
        });
    }
    
    // 检查是否存活
    isAlive() {
        return this.currentHP > 0 && this.active;
    }
    
    // 治疗
    heal(amount) {
        this.currentHP = Math.min(this.maxHP, this.currentHP + amount);
    }
    
    // 获取血量百分比
    getHealthPercentage() {
        return (this.currentHP / this.maxHP) * 100;
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
    
    // 设置移动角度和速度
    setMoveAngle(angle, speed = null) {
        this.targetAngle = angle;
        if (speed !== null) {
            this.moveSpeed = speed;
        }
        
        // 计算速度向量
        this.velocityX = Math.cos(angle) * this.moveSpeed;
        this.velocityY = Math.sin(angle) * this.moveSpeed;
        
        // 根据移动方向设置面向
        if (this.velocityX > 0) {
            this.facingRight = true;
            this.setFlipX(false);
        } else if (this.velocityX < 0) {
            this.facingRight = false;
            this.setFlipX(true);
        }
        
        this.isMoving = true;
        
        // 只有在不攻击时才播放移动动画
        if (!this.isAttacking) {
            this.play(this.animations.move, true);
        }
    }
    
    // 停止移动
    stop() {
        this.velocityX = 0;
        this.velocityY = 0;
        this.isMoving = false;
        
        if (!this.isAttacking) {
            this.play(this.animations.idle, true);
        }
    }
    
    // 更新位置（需要在场景的update中调用）
    updatePosition(deltaTime) {
        if (this.isMoving && !this.isAttacking) {
            const deltaSeconds = deltaTime / 1000;
            this.x += this.velocityX * deltaSeconds;
            this.y += this.velocityY * deltaSeconds;
        }
    }
    
    // 检查边界并反弹
    checkBounds() {
        const margin = 50; // 边界边距
        
        if (this.x <= margin) {
            this.x = margin;
            this.bounceOffWall();
        } else if (this.x >= 1280 - margin) {
            this.x = 1280 - margin;
            this.bounceOffWall();
        }
        
        if (this.y <= margin) {
            this.y = margin;
            this.bounceOffWall();
        } else if (this.y >= 720 - margin) {
            this.y = 720 - margin;
            this.bounceOffWall();
        }
    }
    
    // 从墙壁反弹
    bounceOffWall() {
        // 简单的反弹：反转速度方向
        this.velocityX = -this.velocityX;
        this.velocityY = -this.velocityY;
        
        // 更新面向
        if (this.velocityX > 0) {
            this.facingRight = true;
            this.setFlipX(false);
        } else if (this.velocityX < 0) {
            this.facingRight = false;
            this.setFlipX(true);
        }
    }
    
    // 寻找最近的敌人
    findNearestEnemy(enemies) {
        let nearestEnemy = null;
        let nearestDistance = Infinity;
        
        enemies.forEach(enemy => {
            if (enemy.active && enemy.isAlive() && enemy.faction !== this.faction) {
                const distance = Phaser.Math.Distance.Between(this.x, this.y, enemy.x, enemy.y);
                if (distance < nearestDistance) {
                    nearestDistance = distance;
                    nearestEnemy = enemy;
                }
            }
        });
        
        return nearestEnemy;
    }
    
    // 检查是否在攻击范围内
    isInAttackRange(target) {
        if (!target || !target.active || !target.isAlive()) return false;
        const distance = Phaser.Math.Distance.Between(this.x, this.y, target.x, target.y);
        return distance <= this.attackRange;
    }
    
    // 检查是否在寻敌范围内
    isInSearchRange(target) {
        if (!target || !target.active || !target.isAlive()) return false;
        const distance = Phaser.Math.Distance.Between(this.x, this.y, target.x, target.y);
        return distance <= this.searchRange;
    }
    
    // 面向目标
    faceTarget(target) {
        if (!target) return;
        
        const targetDirection = target.x - this.x;
        if (targetDirection > 0) {
            this.facingRight = true;
            this.setFlipX(false);
        } else if (targetDirection < 0) {
            this.facingRight = false;
            this.setFlipX(true);
        }
    }
    
    // 移动到目标
    moveToTarget(target) {
        if (!target || !target.isAlive()) return;
        
        const distance = Phaser.Math.Distance.Between(this.x, this.y, target.x, target.y);
        
        // 如果距离大于攻击范围，就移动
        if (distance > this.attackRange) {
            // 计算移动方向
            const angle = Phaser.Math.Angle.Between(this.x, this.y, target.x, target.y);
            this.setMoveAngle(angle);
            this.isMoving = true;
            this.isSearching = true;
        } else {
            // 到达攻击范围，停止移动
            this.stop();
            this.isSearching = false;
        }
    }
    
    // 自动攻击逻辑
    autoAttack(enemies, deltaTime) {
        // 如果死亡，不执行攻击
        if (!this.isAlive()) return;
        
        // 更新攻击冷却
        if (this.attackCooldown > 0) {
            this.attackCooldown -= deltaTime;
        }
        
        // 如果正在攻击，不执行寻敌逻辑
        if (this.isAttacking) return;
        
        // 寻找最近的敌人
        const nearestEnemy = this.findNearestEnemy(enemies);
        
        if (nearestEnemy) {
            // 更新当前目标
            this.currentTarget = nearestEnemy;
            
            // 面向目标
            this.faceTarget(nearestEnemy);
            
            const distance = Phaser.Math.Distance.Between(this.x, this.y, nearestEnemy.x, nearestEnemy.y);
            
            if (distance <= this.attackRange) {
                // 在攻击范围内，停止移动并攻击
                this.stop();
                this.isSearching = false;
                
                // 如果不在攻击冷却中且没有正在攻击
                if (this.attackCooldown <= 0 && !this.isAttacking) {
                    if (this.isArcher) {
                        // 弓箭手攻击敌人中心
                        this.archerAttack(nearestEnemy.x, nearestEnemy.y - nearestEnemy.displayHeight / 2, nearestEnemy);
                    } else {
                        // 近战攻击
                        this.performMeleeAttack();
                    }
                    
                    // 设置攻击冷却
                    this.attackCooldown = this.attackCooldownTime;
                }
            } else {
                // 不在攻击范围内，移动到目标
                // 移除寻敌范围限制，让角色始终移动向最近的敌人
                this.moveToTarget(nearestEnemy);
            }
        } else {
            // 没有敌人，停止移动
            this.stop();
            this.isSearching = false;
            this.currentTarget = null;
        }
    }
    
    // 近战攻击方法
    performMeleeAttack() {
        if (this.isAttacking || !this.isAlive()) return;
        
        this.isAttacking = true;
        this.play(this.animations.attack, true);
        
        // 攻击动画进行到一半时造成伤害
        this.scene.time.delayedCall(300, () => {
            if (this.active && this.isAlive() && this.currentTarget && this.currentTarget.isAlive()) {
                const damage = this.currentTarget.takeDamage(this.attack);
                // 显示伤害数字
                this.showDamageNumber(this.currentTarget.x, this.currentTarget.y, damage);
            }
        });
        
        // 攻击动画结束后恢复
        this.once('animationcomplete-' + this.animations.attack, () => {
            this.isAttacking = false;
            if (this.isMoving && this.isAlive()) {
                this.play(this.animations.move, true);
            } else if (this.isAlive()) {
                this.play(this.animations.idle, true);
            }
        });
    }
    
    // 重写攻击方法，根据角色类型选择攻击方式
    attack(targetX = 640, targetY = 360, targetCharacter = null) {
        if (this.isAttacking || !this.isAlive()) return;
        
        if (this.isArcher) {
            this.archerAttack(targetX, targetY, targetCharacter);
        } else {
            // 近战攻击
            this.performMeleeAttack();
        }
    }
    
    // 弓箭手特殊攻击方法
    archerAttack(targetX = 640, targetY = 360, targetCharacter = null) {
        if (this.isAttacking || !this.isArcher || !this.isAlive()) return;
        
        // 计算目标方向并调整面向
        const targetDirection = targetX - this.x;
        if (targetDirection > 0) {
            this.facingRight = true;
            this.setFlipX(false);
        } else if (targetDirection < 0) {
            this.facingRight = false;
            this.setFlipX(true);
        }
        
        // 攻击期间停止移动，避免原地踏步
        this.stop();
        this.isAttacking = true;
        this.play(this.animations.attack, true);
        
        // 攻击动画进行到一半时射出弓箭
        this.scene.time.delayedCall(250, () => {
            if (this.active && this.isAlive()) {
                this.shootArrow(targetX, targetY, targetCharacter);
            }
        });
        
        // 攻击动画结束后恢复
        this.once('animationcomplete-' + this.animations.attack, () => {
            this.isAttacking = false;
            // 攻击结束后，如果还在寻敌状态，继续移动
            if (this.isSearching && this.isAlive()) {
                this.play(this.animations.move, true);
            } else if (this.isAlive()) {
                this.play(this.animations.idle, true);
            }
        });
    }
    
    // 射出弓箭
    shootArrow(targetX, targetY, targetCharacter = null) {
        if (!this.isArcher || !this.isAlive()) return;
        
        // 计算弓箭起始位置（角色中心）
        const startX = this.x;
        const startY = this.y - this.displayHeight / 2; // 角色中心位置
        
        // 创建弓箭
        const Arrow = this.scene.arrowClass; // 需要在场景中设置
        if (Arrow) {
            const arrow = new Arrow(this.scene, startX, startY, targetX, targetY, this.attack, this.faction, targetCharacter);
            this.arrows.push(arrow);
            
            // 清理已销毁的弓箭
            this.arrows = this.arrows.filter(arrow => arrow.active);
        }
    }
    
    // 更新弓箭
    updateArrows(deltaTime) {
        if (!this.isArcher || !this.isAlive()) return;
        
        this.arrows.forEach(arrow => {
            if (arrow.active) {
                arrow.update(deltaTime);
            }
        });
        
        // 清理已销毁的弓箭
        this.arrows = this.arrows.filter(arrow => arrow.active);
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
    
    // 设置移动速度
    setMoveSpeed(speed) {
        this.moveSpeed = speed;
    }
    
    // 获取当前状态
    getState() {
        return {
            isMoving: this.isMoving,
            isAttacking: this.isAttacking,
            facingRight: this.facingRight,
            x: this.x,
            y: this.y,
            faction: this.faction,
            attackRange: this.attackRange,
            hasTarget: this.currentTarget !== null,
            currentHP: this.currentHP,
            maxHP: this.maxHP,
            healthPercentage: this.getHealthPercentage(),
            attack: this.attack,
            defense: this.defense,
            isAlive: this.isAlive()
        };
    }
    
    // 更新方法，可以在场景的update中调用
    update() {
        // 可以在这里添加额外的更新逻辑
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
    
    // 原有的左右移动方法保留用于键盘控制
    moveLeft() {
        if (this.isAttacking || !this.isAlive()) return;
        this.setMoveAngle(Math.PI, this.moveSpeed);
    }
    
    moveRight() {
        if (this.isAttacking || !this.isAlive()) return;
        this.setMoveAngle(0, this.moveSpeed);
    }
    
    moveUp() {
        if (this.isAttacking || !this.isAlive()) return;
        this.setMoveAngle(-Math.PI / 2, this.moveSpeed);
    }
    
    moveDown() {
        if (this.isAttacking || !this.isAlive()) return;
        this.setMoveAngle(Math.PI / 2, this.moveSpeed);
    }
} 