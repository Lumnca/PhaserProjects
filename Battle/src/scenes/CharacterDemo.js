import { Character } from '../Character.js';
import { CharacterData } from '../CharacterData.js';
import { Arrow } from '../Arrow.js';

export class CharacterDemo extends Phaser.Scene {
    constructor() {
        super({ key: 'CharacterDemo' });
        this.characters = [];
        this.cursors = null;
        this.arrowClass = Arrow; // 设置Arrow类引用
        this.damageTexts = []; // 存储伤害数字
    }

    preload() {
        // 预加载角色资源
        Character.preload(this, 'archer');
        Character.preload(this, 'barbar_worker');
        
        // 加载弓箭资源
        Arrow.preload(this);
    }

    create() {
        // 设置背景
        this.add.rectangle(640, 360, 1280, 720, 0x87CEEB);
        
        // 添加一些装饰性的圆圈
        this.add.circle(180, 220, 45, 0xffffff, 0.18);
        this.add.circle(1100, 220, 45, 0xffffff, 0.18);
        
        // 创建50个barbar_worker角色（左侧阵营）
        for (let i = 0; i < 50; i++) {
            const x = Phaser.Math.Between(100, 600); // 左侧区域
            const y = Phaser.Math.Between(100, 620);
            
            // 创建CharacterData实例
            const characterData = new CharacterData('barbar_worker', x, y);
            
            // 创建Character实例
            const character = new Character(this, characterData);
            
            // 设置角色大小为32px宽度
            character.setDisplaySize(32, 31.5); // 保持宽高比
            
            this.characters.push(character);
        }
        
        // 创建50个archer角色（右侧阵营）
        for (let i = 0; i < 50; i++) {
            const x = Phaser.Math.Between(680, 1180); // 右侧区域
            const y = Phaser.Math.Between(100, 620);
            
            // 创建CharacterData实例
            const characterData = new CharacterData('archer', x, y);
            
            // 创建Character实例
            const character = new Character(this, characterData);
            
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
                const firstCharacterData = firstCharacter.getCharacterData();
                const allCharacterData = this.characters.map(c => c.getCharacterData());
                const nearestEnemy = firstCharacterData.findNearestEnemy(allCharacterData);
                if (nearestEnemy) {
                    firstCharacterData.faceTarget(nearestEnemy);
                    if (firstCharacterData.isArcher) {
                        // 弓箭手攻击敌人中心
                        const targetX = nearestEnemy.x;
                        const targetY = nearestEnemy.y - 20; // 使用固定偏移
                        // 这里需要实现弓箭攻击逻辑
                        console.log('弓箭手攻击:', targetX, targetY);
                    } else {
                        // 近战攻击
                        if (firstCharacterData.isInAttackRange(nearestEnemy)) {
                            const damage = nearestEnemy.takeDamage(firstCharacterData.attack);
                            // 找到对应的Character实例来显示伤害数字
                            const enemyCharacter = this.characters.find(c => c.getCharacterData() === nearestEnemy);
                            if (enemyCharacter) {
                                firstCharacter.showDamageNumber(nearestEnemy.x, nearestEnemy.y, damage);
                            }
                        }
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
        this.characters = this.characters.filter(character => {
            const characterData = character.getCharacterData();
            if (!characterData.isAlive()) {
                // 角色死亡，销毁Character实例
                character.destroy();
                return false;
            }
            return true;
        });
        
        // 更新所有角色的寻敌和自动攻击
        this.characters.forEach((character, index) => {
            if (index === 0) return; // 跳过第一个角色（玩家控制）
            
            const characterData = character.getCharacterData();
            
            // 更新角色数据
            characterData.update(delta);
            
            // 自动攻击逻辑 - 传入所有角色的CharacterData
            const allCharacterData = this.characters.map(c => c.getCharacterData());
            characterData.autoAttack(allCharacterData, delta, (enemy, damage) => {
                // 找到对应的Character实例来显示伤害数字
                const enemyCharacter = this.characters.find(c => c.getCharacterData() === enemy);
                if (enemyCharacter) {
                    character.showDamageNumber(enemy.x, enemy.y, damage);
                }
            });
            
            // 更新渲染
            character.updateRender();
        });
        
        // 处理键盘输入（控制第一个角色）
        if (this.characters.length > 0) {
            const firstCharacter = this.characters[0];
            const firstCharacterData = firstCharacter.getCharacterData();
            
            if (!firstCharacterData.isAlive()) return;
            
            // 键盘控制移动
            if (this.cursors.left.isDown) {
                firstCharacterData.setMoveAngle(Math.PI, firstCharacterData.moveSpeed);
            } else if (this.cursors.right.isDown) {
                firstCharacterData.setMoveAngle(0, firstCharacterData.moveSpeed);
            } else if (this.cursors.up.isDown) {
                firstCharacterData.setMoveAngle(-Math.PI / 2, firstCharacterData.moveSpeed);
            } else if (this.cursors.down.isDown) {
                firstCharacterData.setMoveAngle(Math.PI / 2, firstCharacterData.moveSpeed);
            } else {
                firstCharacterData.stop();
            }
            
            // 更新第一个角色的数据
            firstCharacterData.update(delta);
            
            // 更新第一个角色的渲染
            firstCharacter.updateRender();
        }
        
        // 更新状态显示
        if (this.characters.length > 0) {
            const firstCharacter = this.characters[0];
            const firstCharacterData = firstCharacter.getCharacterData();
            
            if (firstCharacterData.isAlive()) {
                const state = firstCharacterData.getState();
                const currentSpeed = Math.round(Math.sqrt(Math.pow(firstCharacterData.velocityX, 2) + Math.pow(firstCharacterData.velocityY, 2)));
                
                // 获取最近的敌人信息
                const allCharacterData = this.characters.map(c => c.getCharacterData());
                const nearestEnemy = firstCharacterData.findNearestEnemy(allCharacterData);
                let enemyInfo = '无敌人';
                if (nearestEnemy) {
                    const distance = Phaser.Math.Distance.Between(firstCharacterData.x, firstCharacterData.y, nearestEnemy.x, nearestEnemy.y);
                    enemyInfo = `${nearestEnemy.characterKey} (${Math.round(distance)}px)`;
                }
                
                this.stateText.setText([
                    `第一个角色位置: (${Math.round(state.x)}, ${Math.round(state.y)})`,
                    `角色类型: ${firstCharacterData.characterKey}`,
                    `阵营: ${state.faction}`,
                    `血量: ${state.currentHP}/${state.maxHP} (${Math.round(state.healthPercentage)}%)`,
                    `攻击力: ${state.attack}`,
                    `防御力: ${state.defense}`,
                    `攻击范围: ${state.attackRange}px`,
                    `寻敌范围: ${firstCharacterData.searchRange}px`,
                    `移动中: ${state.isMoving}`,
                    `寻敌中: ${firstCharacterData.isSearching}`,
                    `攻击中: ${state.isAttacking}`,
                    `有目标: ${state.hasTarget}`,
                    `面向: ${state.facingRight ? '右' : '左'}`,
                    `移动速度: ${currentSpeed}px/s`,
                    `最近敌人: ${enemyInfo}`,
                    `攻击冷却: ${Math.round(firstCharacterData.attackCooldown)}ms`
                ]);
            } else {
                this.stateText.setText(['第一个角色已死亡']);
            }
            
            // 统计角色数量
            const barbarCount = this.characters.filter(c => c.getCharacterData().characterKey === 'barbar_worker' && c.getCharacterData().isAlive()).length;
            const archerCount = this.characters.filter(c => c.getCharacterData().characterKey === 'archer' && c.getCharacterData().isAlive()).length;
            const totalAlive = barbarCount + archerCount;
            
            // 统计移动中的角色
            const movingCount = this.characters.filter(c => c.getCharacterData().isAlive() && c.getCharacterData().isMoving).length;
            const searchingCount = this.characters.filter(c => c.getCharacterData().isAlive() && c.getCharacterData().isSearching).length;
            const attackingCount = this.characters.filter(c => c.getCharacterData().isAlive() && c.getCharacterData().isAttacking).length;
            
            this.statsText.setText([
                `角色统计:`,
                `野蛮人: ${barbarCount} 存活`,
                `弓箭手: ${archerCount} 存活`,
                `总计: ${totalAlive} 存活`,
                `移动中: ${movingCount}`,
                `寻敌中: ${searchingCount}`,
                `攻击中: ${attackingCount}`
            ]);
        }
    }
} 