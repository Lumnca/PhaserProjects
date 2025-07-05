import { Character } from '../Character.js';
import { Arrow } from '../Arrow.js';

export class CharacterDemo extends Phaser.Scene {
    constructor() {
        super('CharacterDemo');
        this.characters = [];
        this.cursors = null;
        this.arrowClass = Arrow; // 设置Arrow类引用
        this.damageTexts = []; // 存储伤害数字
    }

    preload() {
        // 加载角色资源
        Character.preload(this, 'barbar_worker');
        Character.preload(this, 'archer');
        
        // 加载弓箭资源
        Arrow.preload(this);
    }

    create() {
        // 创建彩色渐变背景
        const graphics = this.add.graphics();
        graphics.fillGradientStyle(0x4a90e2, 0x4a90e2, 0x87ceeb, 0x87ceeb, 1);
        graphics.fillRect(0, 0, 1280, 720);
        
        // 添加一些装饰性的云朵或装饰
        this.add.circle(200, 150, 50, 0xffffff, 0.3);
        this.add.circle(250, 120, 30, 0xffffff, 0.2);
        this.add.circle(300, 180, 40, 0xffffff, 0.25);
        
        this.add.circle(1000, 200, 60, 0xffffff, 0.2);
        this.add.circle(1050, 160, 35, 0xffffff, 0.15);
        this.add.circle(1100, 220, 45, 0xffffff, 0.18);
        
        // 创建50个barbar_worker角色（左侧阵营）
        for (let i = 0; i < 50; i++) {
            const x = Phaser.Math.Between(100, 600); // 左侧区域
            const y = Phaser.Math.Between(100, 620);
            const character = new Character(this, x, y, 'barbar_worker');
            
            // 设置角色大小为32px宽度
            character.setDisplaySize(32, 31.5); // 保持宽高比
            
            this.characters.push(character);
        }
        
        // 创建50个archer角色（右侧阵营）
        for (let i = 0; i < 50; i++) {
            const x = Phaser.Math.Between(680, 1180); // 右侧区域
            const y = Phaser.Math.Between(100, 620);
            const character = new Character(this, x, y, 'archer');
            
            // 设置角色大小为32px宽度
            character.setDisplaySize(32, 31.5); // 保持宽高比
            
            this.characters.push(character);
        }
        
        // 设置键盘控制（控制第一个角色）
        this.cursors = this.input.keyboard.createCursorKeys();
        
        // 添加攻击键
        this.input.keyboard.on('keydown-SPACE', () => {
            if (this.characters.length > 0) {
                // 手动攻击最近的敌人
                const firstCharacter = this.characters[0];
                const nearestEnemy = firstCharacter.findNearestEnemy(this.characters);
                if (nearestEnemy) {
                    firstCharacter.faceTarget(nearestEnemy);
                    if (firstCharacter.isArcher) {
                        firstCharacter.attack(nearestEnemy.x, nearestEnemy.y - nearestEnemy.displayHeight / 2, nearestEnemy);
                    } else {
                        // 近战攻击
                        firstCharacter.attack();
                    }
                }
            }
        });
        
        // 添加说明文字
        this.add.text(16, 16, '智能寻敌系统：角色自动寻找并攻击最近的敌人', {
            fontSize: '12px',
            fill: '#fff',
            backgroundColor: '#000',
            padding: { x: 10, y: 5 }
        });
        
        // 添加状态显示
        this.stateText = this.add.text(16, 45, '', {
            fontSize: '12px',
            fill: '#fff',
            backgroundColor: '#000',
            padding: { x: 10, y: 5 }
        });
        
        // 添加角色统计
        this.statsText = this.add.text(16, 150, '', {
            fontSize: '12px',
            fill: '#fff',
            backgroundColor: '#000',
            padding: { x: 10, y: 5 }
        });
    }

    // 显示伤害数字
    showDamageNumber(x, y, damage) {
        const damageText = this.add.text(x, y - 50, damage.toString(), {
            fontSize: '16px',
            fill: '#ff0000',
            stroke: '#000',
            strokeThickness: 2
        }).setOrigin(0.5);
        
        this.damageTexts.push(damageText);
        
        // 伤害数字动画
        this.tweens.add({
            targets: damageText,
            y: y - 100,
            alpha: 0,
            duration: 1000,
            onComplete: () => {
                damageText.destroy();
                this.damageTexts = this.damageTexts.filter(text => text.active);
            }
        });
    }

    update(time, delta) {
        // 清理已死亡的角色
        this.characters = this.characters.filter(character => character.active);
        
        // 更新所有角色的寻敌和自动攻击
        this.characters.forEach((character, index) => {
            if (index === 0) return; // 跳过第一个角色（玩家控制）
            
            // 如果角色死亡，跳过更新
            if (!character.isAlive()) return;
            
            // 更新位置
            character.updatePosition(delta);
            
            // 检查边界并反弹
            character.checkBounds();
            
            // 自动攻击逻辑
            character.autoAttack(this.characters, delta);
            
            // 更新弓箭（如果是archer）
            if (character.isArcher) {
                character.updateArrows(delta);
            }
        });
        
        // 处理键盘输入（控制第一个角色）
        if (this.characters.length > 0) {
            const firstCharacter = this.characters[0];
            
            if (!firstCharacter.isAlive()) return;
            
            // 键盘控制移动
            if (this.cursors.left.isDown) {
                firstCharacter.moveLeft();
            } else if (this.cursors.right.isDown) {
                firstCharacter.moveRight();
            } else if (this.cursors.up.isDown) {
                firstCharacter.moveUp();
            } else if (this.cursors.down.isDown) {
                firstCharacter.moveDown();
            } else {
                firstCharacter.stop();
            }
            
            // 更新第一个角色的位置
            firstCharacter.updatePosition(delta);
            firstCharacter.checkBounds();
            
            // 更新第一个角色的弓箭（如果是archer）
            if (firstCharacter.isArcher) {
                firstCharacter.updateArrows(delta);
            }
        }
        
        // 更新状态显示
        if (this.characters.length > 0) {
            const firstCharacter = this.characters[0];
            
            if (firstCharacter.isAlive()) {
                const state = firstCharacter.getState();
                const currentSpeed = Math.round(Math.sqrt(Math.pow(firstCharacter.velocityX, 2) + Math.pow(firstCharacter.velocityY, 2)));
                
                // 获取最近的敌人信息
                const nearestEnemy = firstCharacter.findNearestEnemy(this.characters);
                let enemyInfo = '无敌人';
                if (nearestEnemy) {
                    const distance = Phaser.Math.Distance.Between(firstCharacter.x, firstCharacter.y, nearestEnemy.x, nearestEnemy.y);
                    enemyInfo = `${nearestEnemy.characterKey} (${Math.round(distance)}px)`;
                }
                
                this.stateText.setText([
                    `第一个角色位置: (${Math.round(state.x)}, ${Math.round(state.y)})`,
                    `角色类型: ${firstCharacter.characterKey}`,
                    `阵营: ${state.faction}`,
                    `血量: ${state.currentHP}/${state.maxHP} (${Math.round(state.healthPercentage)}%)`,
                    `攻击力: ${state.attack}`,
                    `防御力: ${state.defense}`,
                    `攻击范围: ${state.attackRange}px`,
                    `寻敌范围: ${firstCharacter.searchRange}px`,
                    `移动中: ${state.isMoving}`,
                    `寻敌中: ${firstCharacter.isSearching}`,
                    `攻击中: ${state.isAttacking}`,
                    `有目标: ${state.hasTarget}`,
                    `面向: ${state.facingRight ? '右' : '左'}`,
                    `移动速度: ${currentSpeed}px/s`,
                    `最近敌人: ${enemyInfo}`,
                    `攻击冷却: ${Math.round(firstCharacter.attackCooldown)}ms`
                ]);
            } else {
                this.stateText.setText(['第一个角色已死亡']);
            }
            
            // 统计角色数量
            const barbarCount = this.characters.filter(c => c.characterKey === 'barbar_worker' && c.isAlive()).length;
            const archerCount = this.characters.filter(c => c.characterKey === 'archer' && c.isAlive()).length;
            const totalAlive = barbarCount + archerCount;
            
            // 统计移动中的角色
            const movingCount = this.characters.filter(c => c.isAlive() && c.isMoving).length;
            const searchingCount = this.characters.filter(c => c.isAlive() && c.isSearching).length;
            const attackingCount = this.characters.filter(c => c.isAlive() && c.isAttacking).length;
            
            this.statsText.setText([
                `存活角色数: ${totalAlive}`,
                `Barbar Worker: ${barbarCount}`,
                `Archer: ${archerCount}`,
                `移动中: ${movingCount}`,
                `寻敌中: ${searchingCount}`,
                `攻击中: ${attackingCount}`,
                `活跃弓箭数: ${this.characters.reduce((total, c) => total + c.arrows.length, 0)}`,
                `攻击范围 - Barbar: 30px, Archer: 250px`,
                `寻敌范围: 400px`,
                `属性对比 - Barbar: HP120/ATK20/DEF15, Archer: HP80/ATK25/DEF8`
            ]);
        }
    }
} 