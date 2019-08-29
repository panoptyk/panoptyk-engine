import "pixi";
import "p2";
import "phaser-ce";

import * as io from "socket.io-client";

import { Config } from "./config";

import { Boot } from "./states/boot";
import { Preload } from "./states/preload";
import { Game } from "./states/game";
import { ClientAPI } from "../core/panoptykClientAPI";

class Template extends Phaser.Game {
  constructor() {
    super(
      Config.gameWidth,
      Config.gameHeight,
      Phaser.CANVAS,
      "content",
      undefined
    );

    this.state.add("Boot", Boot, false);
    this.state.add("Preload", Preload, false);
    this.state.add("Game", Game, false);

    this.state.start("Boot");
  }
}

(window as any).cAPI = ClientAPI;

window.onload = () => {

  ClientAPI.login("phaser_man1", "nill").then(res => console.log("Success! " + ClientAPI.playerAgent)).catch(err => console.log("fail!"));

  new Template();
};
