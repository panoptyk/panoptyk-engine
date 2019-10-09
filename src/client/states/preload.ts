export class Preload extends Phaser.State {
    private ready: boolean;

    public preload(): void {
        // Load awesome fonts
        this.game.load.bitmapFont("font", "assets/fonts/font.png", "assets/fonts/font.xml");

        // Load button
        this.game.load.spritesheet("button", "assets/sprites/button_sprite_sheet.png", 193, 71);

        // Load Mario Assets
        this.game.load.image("tiles", "assets/tilemaps/tiles/super_mario.png");

        // Load room1 tile map
        this.game.load.tilemap("room1", "assets/tilemaps/maps/room1.json", undefined, Phaser.Tilemap.TILED_JSON);

        // Load dungeon tileset
        this.game.load.image("dungeon_tiles", "assets/tilemaps/tiles/tiles_dungeon_v1.1.png");

        //  Load door object assets
        this.game.load.image("door", "assets/sprites/door.png");
        this.game.load.image("sideDoor", "assets/sprites/sideDoor.png");

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