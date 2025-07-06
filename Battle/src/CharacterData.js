// 角色数据基类
export class CharacterData {
    constructor(characterKey, x, y) {
        this.characterKey = characterKey;
        this.x = x;
        this.y = y;
        this.facingRight = true;
        this.isMoving = false;
        this.isAttacking = false;
        this.moveSpeed = 200;
        
        // 2D移动相关属性
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
        
        // 目标切换相关属性
        this.targetSwitchCooldown = 0; // 目标切换冷却时间
        this.targetSwitchCooldownTime = 3000; // 目标切换冷却时间（毫秒）
        this.lastTargetSwitchTime = 0; // 上次切换目标的时间
        
        // 全局索敌相关属性
        this.patrolMode = false; // 巡逻模式
        this.patrolTarget = null; // 巡逻目标点
        this.patrolRadius = 200; // 巡逻半径
        this.lastPatrolChange = 0; // 上次改变巡逻目标的时间
        this.patrolChangeInterval = 5000; // 巡逻目标改变间隔（毫秒）
        this.idleTime = 0; // 空闲时间
        this.maxIdleTime = 3000; // 最大空闲时间（毫秒）
        
        // 初始化角色属性
        this.initializeStats();
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
            this.attack = 30;
            this.defense = 10;
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
        
        // 清理弓箭（如果有的话）
        if (this.arrows && this.arrows.length > 0) {
            this.arrows.forEach(arrow => {
                if (arrow && typeof arrow.destroy === 'function') {
                    arrow.destroy();
                }
            });
            this.arrows = [];
        }
    }
    
    // 检查是否存活
    isAlive() {
        return this.currentHP > 0;
    }
    
    // 治疗
    heal(amount) {
        this.currentHP = Math.min(this.maxHP, this.currentHP + amount);
    }
    
    // 获取血量百分比
    getHealthPercentage() {
        return (this.currentHP / this.maxHP) * 100;
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
        } else if (this.velocityX < 0) {
            this.facingRight = false;
        }
        
        this.isMoving = true;
    }
    
    // 停止移动
    stop() {
        this.velocityX = 0;
        this.velocityY = 0;
        this.isMoving = false;
    }
    
    // 更新位置
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
        } else if (this.velocityX < 0) {
            this.facingRight = false;
        }
    }
    
    // 寻找最近的敌人
    findNearestEnemy(enemies) {
        let nearestEnemy = null;
        let nearestDistance = Infinity;
        
        enemies.forEach(enemy => {
            if (enemy.isAlive() && enemy.faction !== this.faction) {
                const distance = Phaser.Math.Distance.Between(this.x, this.y, enemy.x, enemy.y);
                if (distance < nearestDistance) {
                    nearestDistance = distance;
                    nearestEnemy = enemy;
                }
            }
        });
        
        return nearestEnemy;
    }
    
    // 寻找最佳敌人（考虑目标分配）
    findBestEnemy(enemies) {
        const currentTime = Date.now();
        
        // 如果当前有目标且目标仍然有效，优先保持当前目标
        if (this.currentTarget && this.currentTarget.isAlive() && 
            this.currentTarget.faction !== this.faction) {
            const distance = Phaser.Math.Distance.Between(this.x, this.y, this.currentTarget.x, this.currentTarget.y);
            // 如果当前目标在合理范围内，继续攻击
            if (distance <= this.searchRange * 1.5) {
                return this.currentTarget;
            }
        }
        
        // 检查目标切换冷却
        if (currentTime - this.lastTargetSwitchTime < this.targetSwitchCooldownTime) {
            // 如果还在冷却中，尝试继续攻击当前目标（如果有效）
            if (this.currentTarget && this.currentTarget.isAlive() && 
                this.currentTarget.faction !== this.faction) {
                return this.currentTarget;
            }
        }
        
        // 寻找所有在寻敌范围内的敌人
        const validEnemies = enemies.filter(enemy => 
            enemy.isAlive() && 
            enemy.faction !== this.faction &&
            this.isInSearchRange(enemy)
        );
        
        if (validEnemies.length === 0) {
            return null;
        }
        
        // 计算每个敌人的"吸引力"分数
        const enemyScores = validEnemies.map(enemy => {
            const distance = Phaser.Math.Distance.Between(this.x, this.y, enemy.x, enemy.y);
            
            // 基础分数：距离越近分数越高
            let score = 1000 - distance;
            
            // 考虑敌人的血量：优先攻击血量低的敌人
            const enemyHealthPercent = enemy.getHealthPercentage();
            score += (100 - enemyHealthPercent) * 2;
            
            // 考虑敌人是否被其他角色攻击（避免群殴）
            const attackersCount = this.countAttackers(enemy, enemies);
            score -= attackersCount * 100; // 每个攻击者减少100分
            
            // 添加一些随机性，避免所有角色选择同一个目标
            score += Phaser.Math.Between(-50, 50);
            
            return { enemy, score };
        });
        
        // 按分数排序，选择分数最高的敌人
        enemyScores.sort((a, b) => b.score - a.score);
        const bestEnemy = enemyScores[0].enemy;
        
        // 如果选择了新目标，更新切换时间
        if (bestEnemy !== this.currentTarget) {
            this.lastTargetSwitchTime = currentTime;
        }
        
        return bestEnemy;
    }
    
    // 计算有多少角色正在攻击指定敌人
    countAttackers(targetEnemy, allCharacters) {
        let count = 0;
        allCharacters.forEach(char => {
            if (char !== this && char.isAlive() && 
                char.currentTarget === targetEnemy && 
                char.faction !== targetEnemy.faction) {
                count++;
            }
        });
        return count;
    }
    
    // 全局寻找敌人（不考虑距离限制）
    findGlobalEnemy(enemies) {
        const validEnemies = enemies.filter(enemy => 
            enemy.isAlive() && 
            enemy.faction !== this.faction
        );
        
        if (validEnemies.length === 0) {
            return null;
        }
        
        // 选择最近的敌人
        let nearestEnemy = null;
        let nearestDistance = Infinity;
        
        validEnemies.forEach(enemy => {
            const distance = Phaser.Math.Distance.Between(this.x, this.y, enemy.x, enemy.y);
            if (distance < nearestDistance) {
                nearestDistance = distance;
                nearestEnemy = enemy;
            }
        });
        
        return nearestEnemy;
    }
    
    // 设置巡逻目标点
    setPatrolTarget() {
        const currentTime = Date.now();
        
        // 如果距离上次改变巡逻目标的时间不够长，不改变
        if (currentTime - this.lastPatrolChange < this.patrolChangeInterval) {
            return;
        }
        
        // 在角色周围随机选择一个巡逻点
        const angle = Phaser.Math.Between(0, 360) * Math.PI / 180;
        const distance = Phaser.Math.Between(50, this.patrolRadius);
        
        const targetX = this.x + Math.cos(angle) * distance;
        const targetY = this.y + Math.sin(angle) * distance;
        
        // 确保巡逻点在游戏边界内
        const margin = 50;
        this.patrolTarget = {
            x: Phaser.Math.Clamp(targetX, margin, 1280 - margin),
            y: Phaser.Math.Clamp(targetY, margin, 720 - margin)
        };
        
        this.lastPatrolChange = currentTime;
        this.patrolMode = true;
    }
    
    // 移动到巡逻目标点
    moveToPatrolTarget() {
        if (!this.patrolTarget) {
            this.setPatrolTarget();
            return;
        }
        
        const distance = Phaser.Math.Distance.Between(this.x, this.y, this.patrolTarget.x, this.patrolTarget.y);
        
        if (distance < 30) {
            // 到达巡逻点，停止移动
            this.stop();
            this.patrolMode = false;
            this.patrolTarget = null;
            this.idleTime = 0;
        } else {
            // 移动到巡逻点
            const angle = Phaser.Math.Angle.Between(this.x, this.y, this.patrolTarget.x, this.patrolTarget.y);
            this.setMoveAngle(angle);
            this.isMoving = true;
        }
    }
    
    // 检查是否有敌人在全局范围内
    hasGlobalEnemy(enemies) {
        return enemies.some(enemy => 
            enemy.isAlive() && 
            enemy.faction !== this.faction
        );
    }
    
    // 检查是否在攻击范围内
    isInAttackRange(target) {
        if (!target || !target.isAlive()) return false;
        const distance = Phaser.Math.Distance.Between(this.x, this.y, target.x, target.y);
        return distance <= this.attackRange;
    }
    
    // 检查是否在寻敌范围内
    isInSearchRange(target) {
        if (!target || !target.isAlive()) return false;
        const distance = Phaser.Math.Distance.Between(this.x, this.y, target.x, target.y);
        return distance <= this.searchRange;
    }
    
    // 面向目标
    faceTarget(target) {
        if (!target) return;
        
        const targetDirection = target.x - this.x;
        if (targetDirection > 0) {
            this.facingRight = true;
        } else if (targetDirection < 0) {
            this.facingRight = false;
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
    autoAttack(enemies, deltaTime, onDamageCallback = null) {
        // 如果死亡，不执行攻击
        if (!this.isAlive()) return;
        
        // 更新攻击冷却
        if (this.attackCooldown > 0) {
            this.attackCooldown -= deltaTime;
        }
        
        // 如果正在攻击，不执行寻敌逻辑
        if (this.isAttacking) return;
        
        // 寻找最佳敌人
        const bestEnemy = this.findBestEnemy(enemies);
        
        if (bestEnemy) {
            // 有附近敌人，重置空闲时间
            this.idleTime = 0;
            this.patrolMode = false;
            this.patrolTarget = null;
            
            // 更新当前目标
            this.currentTarget = bestEnemy;
            
            // 面向目标
            this.faceTarget(bestEnemy);
            
            const distance = Phaser.Math.Distance.Between(this.x, this.y, bestEnemy.x, bestEnemy.y);
            
            if (distance <= this.attackRange) {
                // 在攻击范围内，停止移动并攻击
                this.stop();
                this.isSearching = false;
                
                // 如果不在攻击冷却中且没有正在攻击
                if (this.attackCooldown <= 0 && !this.isAttacking) {
                    // 设置攻击冷却
                    this.attackCooldown = this.attackCooldownTime;
                    this.isAttacking = true;
                    
                    // 造成伤害
                    const damage = bestEnemy.takeDamage(this.attack);
                    
                    // 调用伤害回调函数
                    if (onDamageCallback) {
                        onDamageCallback(bestEnemy, damage);
                    }
                    
                    // 延迟重置攻击状态
                    setTimeout(() => {
                        this.isAttacking = false;
                    }, 500);
                }
            } else {
                // 不在攻击范围内，移动到目标
                this.moveToTarget(bestEnemy);
            }
        } else {
            // 没有附近敌人，检查是否有全局敌人
            const globalEnemy = this.findGlobalEnemy(enemies);
            
            if (globalEnemy) {
                // 有全局敌人，向敌人方向移动
                this.idleTime = 0;
                this.patrolMode = false;
                this.patrolTarget = null;
                
                const distance = Phaser.Math.Distance.Between(this.x, this.y, globalEnemy.x, globalEnemy.y);
                
                if (distance > this.searchRange) {
                    // 敌人太远，向敌人方向移动
                    const angle = Phaser.Math.Angle.Between(this.x, this.y, globalEnemy.x, globalEnemy.y);
                    this.setMoveAngle(angle);
                    this.isMoving = true;
                    this.isSearching = true;
                }
            } else {
                // 完全没有敌人，进入巡逻模式
                this.currentTarget = null;
                this.isSearching = false;
                
                // 增加空闲时间
                this.idleTime += deltaTime;
                
                if (this.idleTime > this.maxIdleTime) {
                    // 空闲时间过长，开始巡逻
                    if (!this.patrolMode) {
                        this.setPatrolTarget();
                    } else {
                        this.moveToPatrolTarget();
                    }
                } else {
                    // 短暂空闲，停止移动
                    this.stop();
                }
            }
        }
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
    
    // 更新方法
    update(deltaTime) {
        this.updatePosition(deltaTime);
        this.checkBounds();
    }
} 