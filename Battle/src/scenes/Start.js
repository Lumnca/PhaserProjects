export class Start extends Phaser.Scene {

    constructor() {
        super('Start');
    }

    preload() {
        this.load.image('background', 'assets/space.png');
        this.load.image('logo', 'assets/phaser.png');

        //  The ship sprite is CC0 from https://ansimuz.itch.io - check out his other work!
        this.load.spritesheet('ship', 'assets/spaceship.png', { frameWidth: 176, frameHeight: 96 });
    }

    create() {
        this.background = this.add.tileSprite(640, 360, 1280, 720, 'background');

        const logo = this.add.image(640, 200, 'logo');

        const ship = this.add.sprite(640, 360, 'ship');

        ship.anims.create({
            key: 'fly',
            frames: this.anims.generateFrameNumbers('ship', { start: 0, end: 2 }),
            frameRate: 15,
            repeat: -1
        });

        ship.play('fly');

        this.tweens.add({
            targets: logo,
            y: 400,
            duration: 1500,
            ease: 'Sine.inOut',
            yoyo: true,
            loop: -1
        });

        // 添加切换到角色演示场景的按钮
        const demoButton = this.add.text(640, 550, '角色演示', {
            fontSize: '32px',
            fill: '#fff',
            backgroundColor: '#4a90e2',
            padding: { x: 20, y: 10 },
            borderRadius: 10
        })
        .setOrigin(0.5)
        .setInteractive()
        .on('pointerdown', () => {
            this.scene.start('CharacterDemo');
        })
        .on('pointerover', () => {
            demoButton.setStyle({ backgroundColor: '#357abd' });
        })
        .on('pointerout', () => {
            demoButton.setStyle({ backgroundColor: '#4a90e2' });
        });

        // 添加说明文字
        this.add.text(640, 600, '点击按钮进入角色演示场景', {
            fontSize: '18px',
            fill: '#fff',
            backgroundColor: '#000',
            padding: { x: 10, y: 5 }
        }).setOrigin(0.5);
    }

    update() {
        this.background.tilePositionX += 2;
    }
    
}
