export class GameActor {
    /**
     * @param {Object} data 角色数据
     */
    constructor(data = {}) {
        this.initializeFromData(data);
    }

    /**
     * 从数据初始化角色
     * @param {Object} data 角色数据
     */
    initializeFromData(data) {
        // 基础信息
        this.name = data.name || '';
        this.level = data.level || 1;
        this.exp = data.exp || 0;
        this.maxExp = data.maxExp || 1000;

        // 属性
        this.attributes = {
            hp: data.attributes?.hp || 100,
            maxHp: data.attributes?.maxHp || 100,
            mp: data.attributes?.mp || 50,
            maxMp: data.attributes?.maxMp || 50,
            strength: data.attributes?.strength || 10,
            agility: data.attributes?.agility || 8,
            intelligence: data.attributes?.intelligence || 12,
            constitution: data.attributes?.constitution || 10,
            physicalAttack: data.attributes?.physicalAttack || 15,
            magicAttack: data.attributes?.magicAttack || 20,
            physicalDefense: data.attributes?.physicalDefense || 10,
            magicDefense: data.attributes?.magicDefense || 8,
            criticalRate: data.attributes?.criticalRate || 5,
            dodgeRate: data.attributes?.dodgeRate || 3,
            hitRate: data.attributes?.hitRate || 95
        };

        // 点数
        this.points = {
            skill: data.points?.skill || 0,
            attribute: data.points?.attribute || 0
        };

        // 资源
        this.resources = {
            gold: data.resources?.gold || 0,
            reputation: data.resources?.reputation || 0
        };

        // 状态
        this.status = {
            buffs: data.status?.buffs || [],
            debuffs: data.status?.debuffs || [],
            states: data.status?.states || []
        };
    }

    /**
     * 获取可序列化的数据对象
     * @returns {Object} 可序列化的数据
     */
    toJSON() {
        return {
            name: this.name,
            level: this.level,
            exp: this.exp,
            maxExp: this.maxExp,
            attributes: { ...this.attributes },
            points: { ...this.points },
            resources: { ...this.resources },
            status: {
                buffs: [...this.status.buffs],
                debuffs: [...this.status.debuffs],
                states: [...this.status.states]
            }
        };
    }

    /**
     * 从JSON数据创建角色实例
     * @param {Object} json JSON数据
     * @returns {GameActor} 角色实例
     */
    static fromJSON(json) {
        return new GameActor(json);
    }

    /**
     * 增加经验值
     * @param {number} amount 经验值数量
     * @returns {boolean} 是否升级
     */
    addExp(amount) {
        this.exp += amount;
        if (this.exp >= this.maxExp) {
            return this.levelUp();
        }
        return false;
    }

    /**
     * 升级
     * @returns {boolean} 是否升级成功
     */
    levelUp() {
        if (this.exp < this.maxExp) {
            return false;
        }

        this.level++;
        this.exp -= this.maxExp;
        this.maxExp = Math.floor(this.maxExp * 1.2); // 每级所需经验值增加20%
        
        // 升级时属性增加
        this.attributes.maxHp += 10;
        this.attributes.maxMp += 5;
        this.attributes.hp = this.attributes.maxHp;
        this.attributes.mp = this.attributes.maxMp;
        
        // 获得属性点
        this.points.attribute += 3;
        this.points.skill += 1;

        return true;
    }

    /**
     * 修改属性值
     * @param {string} attributeName 属性名
     * @param {number} value 变化值
     */
    modifyAttribute(attributeName, value) {
        if (attributeName in this.attributes) {
            this.attributes[attributeName] += value;
            
            // 确保HP/MP不超过最大值
            if (attributeName === 'hp') {
                this.attributes.hp = Math.min(this.attributes.hp, this.attributes.maxHp);
            } else if (attributeName === 'mp') {
                this.attributes.mp = Math.min(this.attributes.mp, this.attributes.maxMp);
            }
        }
    }

    /**
     * 添加状态效果
     * @param {string} type 类型 ('buff' | 'debuff' | 'state')
     * @param {Object} effect 效果对象
     */
    addEffect(type, effect) {
        if (type in this.status) {
            this.status[type].push({
                ...effect,
                startTime: Date.now()
            });
        }
    }

    /**
     * 移除状态效果
     * @param {string} type 类型 ('buff' | 'debuff' | 'state')
     * @param {string} effectId 效果ID
     */
    removeEffect(type, effectId) {
        if (type in this.status) {
            this.status[type] = this.status[type].filter(effect => effect.id !== effectId);
        }
    }

    /**
     * 更新状态
     * 用于处理buff/debuff的持续时间等
     */
    update() {
        const now = Date.now();
        
        // 更新各种状态
        ['buffs', 'debuffs', 'states'].forEach(type => {
            this.status[type] = this.status[type].filter(effect => {
                if (!effect.duration) return true; // 永久效果
                return (now - effect.startTime) < effect.duration;
            });
        });
    }
} 