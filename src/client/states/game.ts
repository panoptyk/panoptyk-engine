import { Mushroom } from "../prefabs/mushroom";
import { ClientAPI } from "../../core/panoptykClientAPI";
import { Room } from "../../core/models";

export class Game extends Phaser.State {
  private map: Phaser.Tilemap;

  private room: Room;
  private roomText: Phaser.Text;

  private floorLayer: Phaser.TilemapLayer;
  private wallLayer: Phaser.TilemapLayer;
  private doorObjects: Phaser.Group;

  public create(): void {
    this.game.physics.startSystem(Phaser.Physics.ARCADE);

    this.game.input.mouse.capture = true;

    this.room = ClientAPI.playerAgent.room;

    const style = { font: "65px Arial", fill: "#ffffff" };
    this.roomText = this.game.add.text(undefined, undefined, "Room: " + this.room.roomName, style);
    this.roomText.position.set(this.game.world.centerX - this.roomText.width / 2, 0);

    // add tileset map
    this.map = this.game.add.tilemap("room1");
    this.map.addTilesetImage("dungeon_tileset", "dungeon_tiles");

    // create floor layer
    this.floorLayer = this.map.createLayer("Floor");
    this.floorLayer.fixedToCamera = false;
    this.floorLayer.resize(this.map.tileWidth * this.map.width, this.map.tileHeight * this.map.height);
    this.floorLayer.position.set(this.game.world.centerX - this.floorLayer.width / 2, this.game.world.centerY - this.floorLayer.height / 2);

    // create wall layer
    this.wallLayer = this.map.createLayer("Walls");
    this.wallLayer.fixedToCamera = false;
    this.wallLayer.resize(this.map.tileWidth * this.map.width, this.map.tileHeight * this.map.height);
    this.wallLayer.position.set(this.game.world.centerX - this.wallLayer.width / 2, this.game.world.centerY - this.wallLayer.height / 2);

    // add door objects
    this.doorObjects = this.game.add.group();
    this.doorObjects.inputEnableChildren = true;
    this.map.createFromObjects("Doors", 481, "door", undefined, true, false, this.doorObjects);
    this.map.createFromObjects("Doors", 482, "sideDoor", undefined, true, false, this.doorObjects);
    this.doorObjects.position.set(this.game.world.centerX - this.floorLayer.width / 2, this.game.world.centerY - this.floorLayer.height / 2);
    this.doorObjects.onChildInputDown.add(this.onDoorClicked, this);
  }

  public async onDoorClicked(sprite: Phaser.Sprite): Promise<void> {
    // add a loading image later

    const temp = ClientAPI.playerAgent.room.getAdjacentRooms()[this.doorObjects.getChildIndex(sprite)];
    await ClientAPI.moveToRoom(temp).then(res => {
      this.room = ClientAPI.playerAgent.room;
      this.roomText.setText("Room: " + this.room.roomName);
      console.log("room changed");
    })
    .catch(err => console.log("room change fail!"));
  }
}
