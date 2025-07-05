export class Icon extends Phaser.GameObjects.Sprite {
    static ICON_SIZE = 32;
    static ICONS_PER_ROW = 16;

    /**
     * 创建一个图标
     * @param {Phaser.Scene} scene 场景
     * @param {number} x X坐标
     * @param {number} y Y坐标
     * @param {Object} config 配置
     * @param {number} config.row 图标行号（0开始）
     * @param {number} config.col 图标列号（0开始）
     * @param {number} config.scale 缩放比例（默认1）
     */
    constructor(scene, x, y, config = {}) {
        super(scene, x, y, 'iconSet');

        const {
            row = 0,
            col = 0,
            scale = 1
        } = config;

        // 计算帧索引
        const frameIndex = row * Icon.ICONS_PER_ROW + col;
        this.setFrame(frameIndex);
        
        // 设置缩放
        this.setScale(scale);

        // 添加到场景
        scene.add.existing(this);
    }

    /**
     * 设置图标
     * @param {number} row 行号
     * @param {number} col 列号
     */
    setIcon(row, col) {
        const frameIndex = row * Icon.ICONS_PER_ROW + col;
        this.setFrame(frameIndex);
        return this;
    }
}