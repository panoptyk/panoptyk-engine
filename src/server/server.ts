import fs = require("fs");
import * as util from "../core/utilities/util";
import * as express from "express";
import * as http from "http";
import * as socketIO from "socket.io";
import { logger, LOG } from "../core/utilities/logger";
import { Agent, Room, Info, Item, Conversation, Trade, IDObject } from "../core/models/index";
import { PEvent } from "../core/models/events/pEvent";

export class Server {
  private app: express.Application;
  private server: http.Server;
  private io: socketIO.Server;
  private port: string | number;

  /**
   * List of all models that need to be saved and loaded
   */
  private models: any[] = [
    Agent,
    Room,
    Info,
    Item,
    Conversation,
    Trade,
  ];
  private events: PEvent[] = [];

  constructor(app?: express.Application) {
    this.createApp();
    this.loadConfig();
    this.createServer();
    this.sockets();
  }

  private createApp(app?: express.Application): void {
    this.app = app ? app : express();
  }

  private createServer(): void {
    this.server = http.createServer(this.app);
  }

  private loadConfig(): void {
    // Read settings
    try {
      const settings = fs.readFileSync("panoptyk-settings.json");
      for (const key in settings) {
        util.panoptykSettings[key] = settings[key];
      }
      logger.log("Panoptyk settings loaded", LOG.INFO);
    } catch (err) {
      logger.log("No panoptyk settings found... creating one.", LOG.INFO);
      fs.writeFileSync(
        "panoptyk-settings.json",
        JSON.stringify(util.panoptykSettings)
      );
    }

    // Assign port
    this.port = util.panoptykSettings.port;
  }

  private sockets(): void {
    this.io = socketIO(this.server);
  }

  private listen(): void {
    this.server.listen(this.port, () => {
      logger.log("Starting server on port " + this.port, LOG.INFO);
    });
  }

  private loadModels() {
    util.makeDir(util.panoptykSettings.data_dir); // <- Should suffice
    this.models.forEach((model) => {
      model.loadAll();
    });
  }

  private saveModels() {
    this.models.forEach((model) => {
      model.saveAll();
    });
  }

  public start() {
    this.loadModels();

    // Sets up "ctrl + c" to stop server
    process.on("SIGINT", () => {
      logger.log("Shutting down", LOG.INFO);
      this.saveModels();
      logger.log("Server closed", LOG.INFO);
      process.exit(0);
    });

    // Start http server
    this.listen();
  }

}
