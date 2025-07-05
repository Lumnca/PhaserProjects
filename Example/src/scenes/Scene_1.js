import { Button } from '../components/Button.js';

export class Scene_1 extends Phaser.Scene {

    constructor() {
        super('Scene_1');
    }

    preload() {
        this.load.image('bg_scene','assets/scenes/0_1.png')

        this.load.image('button1', 'assets/buttons/button_4_1.png');
        this.load.image('button2', 'assets/buttons/button_5.png');
        this.load.image('button3', 'assets/buttons/button_3.png');
    }

    create() {
        const actor = this.add.sprite(640, 360, 'bg_scene');
        this.actor = actor;

        const x = 240;
        const y = 200;

         new Button(this, x, y, {
            normal: 'button1',
            hover: 'button2',
            pressed: 'button3',
            text: '睡觉',
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

        new Button(this, x, y + 100, {
            normal: 'button1',
            hover: 'button2',
            pressed: 'button3',
            text: '吃饭',
            textStyle: {
                fontSize: '32px',
                color: '#ffffff',
                stroke: '#000000',
                strokeThickness: 4,
                fontFamily: 'LOLITA',
            },
        })


        new Button(this, x, y + 200, {
            normal: 'button1',
            hover: 'button2',
            pressed: 'button3',
            text: '学习法术',
            textStyle: {
                fontSize: '32px',
                color: '#ffffff',
                stroke: '#000000',
                strokeThickness: 4,
                fontFamily: 'LOLITA',
            },
        })

        
        new Button(this, x, y + 300, {
            normal: 'button1',
            hover: 'button2',
            pressed: 'button3',
            text: '审视自我',
            textStyle: {
                fontSize: '32px',
                color: '#ffffff',
                stroke: '#000000',
                strokeThickness: 4,
                fontFamily: 'LOLITA',
            },
        })

        new Button(this, x, y + 400, {
            normal: 'button1',
            hover: 'button2',
            pressed: 'button3',
            text: '出门',
            textStyle: {
                fontSize: '32px',
                color: '#ffffff',
                stroke: '#000000',
                strokeThickness: 4,
                fontFamily: 'LOLITA',
            },
            onClick:()=>{
                this.scene.start('Scene_21')
            }
        })
    }

    update() {
        
    }
    
}
