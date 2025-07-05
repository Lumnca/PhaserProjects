export class Actor extends Phaser.Scene {

    constructor() {
        super('Actor');
    }

    preload() {
        this.load.image('actor','assets/a1.png')
    }

    create() {
        const actor = this.add.sprite(512, 384, 'actor');
        actor.setScale(0.5,0.5)
        this.actor = actor;
    }

    update() {
        
    }
    
}
