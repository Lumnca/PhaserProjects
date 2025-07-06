import { Button } from '../ui/Button.js';

export class Start extends Phaser.Scene {

    constructor() {
        super('Start');
    }

    preload() {
        this.load.image('background', 'assets/game_bg.png');
        this.load.image('button1', 'assets/buttons/button1.png');
    }

    create() {
        this.background = this.add.image(640, 360, 'background').setDisplaySize(1280, 720);

        // 使用自定义 Button 类
        const startButton = new Button(this, 640, 540, '开始游戏', {
            width: 260,
            height: 100,
            onClick: () => {
                this.scene.start('Map');
            }
        });
    }

    update() {
        this.background.tilePositionX += 2;
    }
    
}
