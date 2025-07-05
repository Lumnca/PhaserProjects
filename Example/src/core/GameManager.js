import { GameData } from '../data/GameData.js';
import { GameActor } from './GameActor.js';

export class GameManager {
    static instance = null;

    constructor() {
        this.gameData = new GameData();
        this.actor = null;
        this.initializeActor();
    }

    /**
     * 获取GameManager单例
     * @returns {GameManager}
     */
    static getInstance() {
        if (!GameManager.instance) {
            GameManager.instance = new GameManager();
        }
        return GameManager.instance;
    }

    /**
     * 初始化角色
     */
    initializeActor() {
        const actorData = this.gameData.get('player');
        this.actor = new GameActor(actorData);

        // 监听角色数据变化
        this.gameData.addListener((path, value) => {
            if (path.startsWith('player')) {
                this.actor.initializeFromData(this.gameData.get('player'));
            }
        });
    }

    /**
     * 保存游戏
     * @param {string} slot 存档槽位
     */
    saveGame(slot = 'auto') {
        // 更新角色数据到GameData
        this.gameData.update('player', this.actor.toJSON());
        return this.gameData.save(slot);
    }

    /**
     * 读取游戏
     * @param {string} slot 存档槽位
     */
    loadGame(slot = 'auto') {
        const success = this.gameData.load(slot);
        if (success) {
            this.initializeActor();
        }
        return success;
    }

    /**
     * 获取存档列表
     * @returns {Array<string>} 存档槽位列表
     */
    getSaveSlots() {
        const slots = [];
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key.startsWith('save_')) {
                slots.push(key.replace('save_', ''));
            }
        }
        return slots;
    }

    /**
     * 获取当前角色实例
     * @returns {GameActor}
     */
    getActor() {
        return this.actor;
    }

    /**
     * 更新游戏
     * 用于处理游戏逻辑更新
     */
    update() {
        if (this.actor) {
            this.actor.update();
        }
    }
} 