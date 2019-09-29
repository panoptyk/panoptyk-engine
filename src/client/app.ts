import "pixi";
import "p2";
import "phaser-ce";

import * as io from "socket.io-client";

import { Config } from "./config";

import { Boot } from "./states/boot";
import { Preload } from "./states/preload";
import { Login } from "./states/login";
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
    this.state.add("Login", Login, false);
    this.state.add("Game", Game, false);

    this.state.start("Boot");
  }
}

(window as any).cAPI = ClientAPI;

window.onload = () => {
  new Template();
};
