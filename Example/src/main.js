import { Start } from './scenes/Start.js';
import { Actor } from './scenes/Actor.js';
import { Slave } from './scenes/Savle.js';
import { Scene_1 } from './scenes/Scene_1.js';
import { Scene_21 } from './scenes/Scene_21.js';

const config = {
    type: Phaser.AUTO,
    title: 'Overlord Rising',
    description: '',
    parent: 'game-container',
    width: 1280,
    height: 720,
    backgroundColor: '#000000',
    pixelArt: false,
    scene: [
        Start,Actor,Scene_21,Scene_1,Slave
    ],
    scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH
    },
}

new Phaser.Game(config);
            