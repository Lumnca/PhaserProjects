 /**
 * 游戏数据管理类
 */
export class GameData {
    constructor() {
        // 初始化默认数据
        this.reset();
        
        // 绑定事件监听器
        this.listeners = new Set();
    }

    /**
     * 重置数据到初始状态
     */
    reset() {
        this.data = {
            player: {
                name: '艾莉丝',
                level: 1,
                exp: 0,
                maxExp: 1000,
                attributes: {
                    hp: 100,
                    maxHp: 100,
                    mp: 50,
                    maxMp: 50,
                    strength: 10,
                    agility: 8,
                    intelligence: 12,
                    constitution: 10,
                    physicalAttack: 15,
                    magicAttack: 20,
                    physicalDefense: 10,
                    magicDefense: 8,
                    criticalRate: 5,
                    dodgeRate: 3,
                    hitRate: 95
                },
                points: {
                    skill: 0,
                    attribute: 0
                },
                resources: {
                    gold: 0,
                    reputation: 0
                }
            },
            // 游戏进度数据
            progress: {
                currentChapter: 1,
                completedQuests: [],
                unlockedAreas: ['hometown'],
                flags: {}  // 存储各种游戏标记
            },
            // 游戏设置
            settings: {
                bgmVolume: 0.7,
                sfxVolume: 1.0,
                language: 'zh_CN'
            },
            // 时间戳
            timestamp: Date.now()
        };
    }

    /**
     * 添加数据变化监听器
     * @param {Function} listener 监听器函数
     */
    addListener(listener) {
        this.listeners.add(listener);
    }

    /**
     * 移除数据变化监听器
     * @param {Function} listener 监听器函数
     */
    removeListener(listener) {
        this.listeners.delete(listener);
    }

    /**
     * 通知所有监听器数据已更新
     * @param {string} path 更新的数据路径
     * @param {any} value 新的值
     */
    notifyListeners(path, value) {
        this.listeners.forEach(listener => {
            listener(path, value);
        });
    }

    /**
     * 更新数据
     * @param {string} path 数据路径，例如 'player.attributes.hp'
     * @param {any} value 新的值
     */
    update(path, value) {
        const parts = path.split('.');
        let current = this.data;
        
        // 遍历路径直到倒数第二个部分
        for (let i = 0; i < parts.length - 1; i++) {
            if (!(parts[i] in current)) {
                current[parts[i]] = {};
            }
            current = current[parts[i]];
        }
        
        // 设置最后一个属性的值
        const lastPart = parts[parts.length - 1];
        current[lastPart] = value;
        
        // 通知监听器
        this.notifyListeners(path, value);
        
        // 自动保存（可以根据需要调整保存策略）
        this.save();
    }

    /**
     * 获取数据
     * @param {string} path 数据路径
     * @returns {any} 数据值
     */
    get(path) {
        const parts = path.split('.');
        let current = this.data;
        
        for (const part of parts) {
            if (current === undefined || current === null) {
                return undefined;
            }
            current = current[part];
        }
        
        return current;
    }

    /**
     * 保存游戏数据
     * @param {string} [slot='auto'] 存档槽位
     */
    save(slot = 'auto') {
        try {
            // 更新时间戳
            this.data.timestamp = Date.now();
            
            // 将数据转换为字符串
            const saveData = JSON.stringify(this.data);
            
            // 保存到 localStorage
            localStorage.setItem(`save_${slot}`, saveData);
            
            console.log(`游戏已保存到槽位: ${slot}`);
            return true;
        } catch (error) {
            console.error('保存游戏失败:', error);
            return false;
        }
    }

    /**
     * 读取游戏数据
     * @param {string} [slot='auto'] 存档槽位
     */
    load(slot = 'auto') {
        try {
            // 从 localStorage 读取数据
            const saveData = localStorage.getItem(`save_${slot}`);
            
            if (!saveData) {
                console.log(`未找到槽位 ${slot} 的存档`);
                return false;
            }
            
            // 解析数据
            const loadedData = JSON.parse(saveData);
            
            // 更新当前数据
            this.data = loadedData;
            
            // 通知所有监听器数据已完全更新
            this.notifyListeners('*', this.data);
            
            console.log(`已读取槽位 ${slot} 的存档`);
            return true;
        } catch (error) {
            console.error('读取存档失败:', error);
            return false;
        }
    }

    /**
     * 获取所有存档槽位信息
     * @returns {Array<{slot: string, timestamp: number, playerName: string, level: number}>}
     */
    getSaveSlots() {
        const slots = [];
        
        // 遍历 localStorage 查找所有存档
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key.startsWith('save_')) {
                try {
                    const saveData = JSON.parse(localStorage.getItem(key));
                    slots.push({
                        slot: key.replace('save_', ''),
                        timestamp: saveData.timestamp,
                        playerName: saveData.player.name,
                        level: saveData.player.level
                    });
                } catch (error) {
                    console.error(`读取槽位 ${key} 失败:`, error);
                }
            }
        }
        
        // 按时间戳排序
        return slots.sort((a, b) => b.timestamp - a.timestamp);
    }

    /**
     * 删除存档
     * @param {string} slot 存档槽位
     */
    deleteSave(slot) {
        try {
            localStorage.removeItem(`save_${slot}`);
            console.log(`已删除槽位 ${slot} 的存档`);
            return true;
        } catch (error) {
            console.error('删除存档失败:', error);
            return false;
        }
    }
}