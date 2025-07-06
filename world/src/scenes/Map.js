import { City } from '../object/City.js';

export class Scene_Map extends Phaser.Scene {
    constructor() {
        super('Map');
    }

    preload() {
        this.load.image('map', 'assets/maps/map.jpeg');
        this.load.json('mapdata', 'data/Map.json');
    }

    create() {
        // 添加大地图
        this.mapImage = this.add.image(0, 0, 'map').setOrigin(0);
        this.cameras.main.setBounds(0, 0, this.mapImage.width, this.mapImage.height);
        this.input.setDefaultCursor('grab');
        this.isDragging = false;
        this.dragStart = { x: 0, y: 0 };
        this.camStart = { x: 0, y: 0 };

        // 固定顶部UI面板（用DOM或Phaser UI）
        this.uiPanel = this.add.rectangle(640, 30, 400, 50, 0x222222, 0.7).setScrollFactor(0);
        this.timeText = this.add.text(640, 30, '时间: 00:00:00', {
            fontSize: '28px',
            color: '#fff',
            fontFamily: 'Arial',
            align: 'center'
        }).setOrigin(0.5).setScrollFactor(0);
        this.elapsed = 0;

        this.input.on('pointerdown', (pointer) => {
            this.isDragging = true;
            this.input.setDefaultCursor('grabbing');
            this.dragStart.x = pointer.x;
            this.dragStart.y = pointer.y;
            this.camStart.x = this.cameras.main.scrollX;
            this.camStart.y = this.cameras.main.scrollY;
        });
        this.input.on('pointerup', () => {
            this.isDragging = false;
            this.input.setDefaultCursor('grab');
        });
        this.input.on('pointermove', (pointer) => {
            if (this.isDragging) {
                const dx = pointer.x - this.dragStart.x;
                const dy = pointer.y - this.dragStart.y;
                this.cameras.main.scrollX = Phaser.Math.Clamp(this.camStart.x - dx, 0, this.mapImage.width - this.cameras.main.width);
                this.cameras.main.scrollY = Phaser.Math.Clamp(this.camStart.y - dy, 0, this.mapImage.height - this.cameras.main.height);
            }
        });

        // 加载城市数据并实例化 City 类
        const mapData = this.cache.json.get('mapdata');
        this._cityMap = new Map();
        if (mapData && mapData.map && mapData.map.cities) {
            // 先创建所有 City 实例
            mapData.map.cities.forEach(cityData => {
                this._cityMap.set(cityData.id, new City(cityData, this._cityMap));
            });
            // 再绘制城市
            mapData.map.cities.forEach(cityData => {
                this.drawCityMark(cityData.x, cityData.y, cityData.name, this._cityMap.get(cityData.id));
            });
        }
    }

    update(time, delta) {
        // 更新时间
        this.elapsed += delta;
        const totalSeconds = Math.floor(this.elapsed / 1000);
        const h = String(Math.floor(totalSeconds / 3600)).padStart(2, '0');
        const m = String(Math.floor((totalSeconds % 3600) / 60)).padStart(2, '0');
        const s = String(totalSeconds % 60).padStart(2, '0');
        this.timeText.setText(`时间: ${h}:${m}:${s}`);
    }

    drawCityMark(x, y, name, cityObj) {
        const radius = 6;
        // 用 graphics 画圆，但用透明的交互 hitArea
        const g = this.add.graphics();
        g.fillStyle(0xffffff, 1);
        g.fillCircle(x, y, radius);
        g.lineStyle(1, 0x000000, 1);
        g.strokeCircle(x, y, radius);
        g.setDepth(1);
        // 创建一个不可见的交互圆点
        const hit = this.add.circle(x, y, radius + 4, 0x000000, 0).setInteractive({ useHandCursor: true });
        hit.on('pointerdown', () => {
            console.log('点击城市:', cityObj);
        });
        hit.setDepth(2);
        // 城市名称，居中显示在圆形上方
        const label = this.add.text(x, y - radius - 6, name, {
            fontSize: '18px',
            color: '#fff',
            fontFamily: 'Arial',
            stroke: '#000',
            strokeThickness: 4
        }).setOrigin(0.5, 1);
        label.setDepth(2);
    }
}
