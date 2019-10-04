export class Preload extends Phaser.State {
    private ready: boolean;

    public preload(): void {
        // Load awesome fonts
        this.game.load.bitmapFont("font", "assets/fonts/font.png", "assets/fonts/font.xml");

        // Load sprite
        this.game.load.image("mushroom", "assets/sprites/mushroom.png");

        // Load button
        this.game.load.spritesheet("button", "assets/sprites/button_sprite_sheet.png", 193, 71);

        // Initialize Howler
        // Sound.load();

        // Plugin Script loader
        this.game.load.script("phaser-input", "assets/scripts/phaser-input/phaser-input.min.js");

        this.load.onLoadComplete.addOnce(this.onLoadComplete, this);
    }

    public create(): void {

    }

    public update(): void {
        if (this.ready === true) {
            this.game.state.start("Login");
        }
    }

    private onLoadComplete(): void {
        this.ready = true;
    }
}