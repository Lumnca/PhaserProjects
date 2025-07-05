import { Button } from '../components/Button.js';

export class Scene_21 extends Phaser.Scene {

    constructor() {
        super('Scene_21');
    }

    preload() {
        this.load.image('bg_scene_2','assets/scenes/2-1.png')

        this.load.image('button1', 'assets/buttons/button_4_1.png');
        this.load.image('button2', 'assets/buttons/button_5.png');
        this.load.image('button3', 'assets/buttons/button_3.png');
    }

    create() {
        const bg = this.add.sprite(640, 360, 'bg_scene_2');
        this.bg = bg;

        const x = 240;
        const y = 200;

         new Button(this, x, y, {
            normal: 'button1',
            hover: 'button2',
            pressed: 'button3',
            text: '奴隶竞拍',
            textStyle: {
                fontSize: '32px',
                color: '#ffffff',
                stroke: '#000000',
                strokeThickness: 4,
                fontFamily: 'LOLITA',
            },
            onClick : ()=>{
                this.scene.start('Slave')
            }
        })

        new Button(this, x, y + 100, {
            normal: 'button1',
            hover: 'button2',
            pressed: 'button3',
            text: '出售奴隶',
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
            text: '离开',
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

        
   
    }

    update() {
        
    }
    
}
