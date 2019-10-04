import { Mushroom } from "../prefabs/mushroom";
import { ClientAPI } from "../../core/panoptykClientAPI";

export class Game extends Phaser.State {
  private mushroom: Mushroom;
  private cursors: Phaser.CursorKeys;
  private text: Phaser.BitmapText;
  private spaceKey: Phaser.Key;

  public create(): void {
    this.game.physics.startSystem(Phaser.Physics.ARCADE);

    this.text = this.game.add.bitmapText(
      this.game.world.centerX,
      this.game.world.centerY + 100,
      "font",
      "Press Arrows / Space",
      15
    );
    this.text.x = this.text.x - ~~(this.text.width * 0.5);

    this.mushroom = new Mushroom(
      this.state.getCurrentState().game,
      this.game.world.centerX,
      this.game.world.centerY
    );
    this.game.add.existing(this.mushroom);

    this.cursors = this.game.input.keyboard.createCursorKeys();
    this.spaceKey = this.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR);
    this.spaceKey.onDown.add(() => {
      if (ClientAPI.canAct()) {
        const rooms = ClientAPI.playerAgent.room.getAdjacentRooms();
        const room = rooms[Math.floor(Math.random() * rooms.length)];
        ClientAPI.moveToRoom(room)
          .then(res => {
            console.log("Moved agent to room: " + room);
          })
          .catch(err => {
            console.log("Failed to move to room!: " + err.message);
          });
      }
    }, this);
  }

  public update(): void {
    this.game.input.update();

    if (this.cursors.down.isDown) {
      this.mushroom.position.y++;
    }
    if (this.cursors.up.isDown) {
      this.mushroom.position.y--;
    }
    if (this.cursors.left.isDown) {
      this.mushroom.position.x--;
    }
    if (this.cursors.right.isDown) {
      this.mushroom.position.x++;
    }
  }
}
