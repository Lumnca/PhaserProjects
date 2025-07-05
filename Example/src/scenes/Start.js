import { Button } from '../components/Button.js';

export class Start extends Phaser.Scene {

    constructor() {
        super('Start');
    }

    preload() {

        this.load.image('background', 'assets/ui/bg.png');
        this.load.image('button1', 'assets/buttons/button_4_1.png');
        this.load.image('button2', 'assets/buttons/button_5.png');
        this.load.image('button3', 'assets/buttons/button_3.png');
    }

    create() {
        const image = this.add.image(0, 0, 'background');
        image.setOrigin(0); // 设置原点为左上角

        // 获取缩放比例
        const scaleX = this.scale.width / image.width;
        const scaleY = this.scale.height / image.height;

        // 选择更大的比例，确保图像填满整个屏幕
        const scale = Math.max(scaleX, scaleY);

        // 应用缩放
        image.setScale(scale);

        // 可选：如果你想让图像居中
        image.setPosition(
            (this.scale.width - image.width * scale) / 2,
            (this.scale.height - image.height * scale) / 2
        );
        this.background = image;


        document.fonts.ready.then(() => {
            // 添加游戏标题
            const titleText = this.add.text(
                this.scale.width / 2,
                this.scale.height / 2 - 200,
                'Examplen奴隶主', // 替换成你的标题
                {
                    fontSize: '48px',
                    color: '#ffffff',
                    fontFamily: 'LOLITA',
                    stroke: '#000000',
                    strokeThickness: 6,
                    align: 'center',
                }
            );
            titleText.setOrigin(0.5); // 让文本居中显示
        });

        const y = 240;

        new Button(this, 200, y, {
            normal: 'button1',
            hover: 'button2',
            pressed: 'button3',
            text: '开始游戏',
            textStyle: {
                fontSize: '32px',
                color: '#ffffff',
                stroke: '#000000',
                strokeThickness: 4,
                fontFamily: 'LOLITA',
            },
            onClick : ()=>{
                this.scene.start('Scene_1');
            }
        })

        new Button(this, 200, y + 100, {
            normal: 'button1',
            hover: 'button2',
            pressed: 'button3',
            text: '继续游戏',
            textStyle: {
                fontSize: '32px',
                color: '#ffffff',
                stroke: '#000000',
                strokeThickness: 4,
                fontFamily: 'LOLITA',
            },
        })


        new Button(this, 200, y + 200, {
            normal: 'button1',
            hover: 'button2',
            pressed: 'button3',
            text: '设置',
            textStyle: {
                fontSize: '32px',
                color: '#ffffff',
                stroke: '#000000',
                strokeThickness: 4,
                fontFamily: 'LOLITA',
            }
        })







        // ship.anims.create({
        //     key: 'fly',
        //     frames: this.anims.generateFrameNumbers('ship', { start: 0, end: 2 }),
        //     frameRate: 15,
        //     repeat: -1
        // });

        // ship.play('fly');

        // this.tweens.add({
        //     targets: logo,
        //     y: 400,
        //     duration: 1500,
        //     ease: 'Sine.inOut',
        //     yoyo: true,
        //     loop: -1
        // });
        // this.input.once('pointerdown', function (event) {

        //     this.scene.start('Actor');

        // }, this);
    }

    update() {
        //this.background.tilePositionX += 2;
    }

}
