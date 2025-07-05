export class Label extends Phaser.GameObjects.Text {
    constructor(scene, x, y, text, style = {}) {
        const defaultStyle = {
            fontFamily: 'Arial',
            fontSize: '16px',
            color: '#ffffff',
            align: 'left'
        };

        super(scene, x, y, text, { ...defaultStyle, ...style });
        scene.add.existing(this);
    }
} 