import fs = require("fs");
import * as util from "../core/utilities/util";
import * as express from "express";
import * as http from "http";
import * as socketIO from "socket.io";
import { logger, LOG } from "../core/utilities/logger";
import {
  Agent,
  Room,
  Info,
  Item,
  Conversation,
  Trade,
  IDObject
} from "../core/models/index";
import {
  Action,
  ActionLogin,
  ActionMoveToRoom
} from "../core/models/action/index";
import { ValidationResult, Validate } from "../core/models/validate";

export class Server {
  private app: express.Application;
  private server: http.Server;
  private io: socketIO.Server;
  private port: string | number;

  /**
   * List of all models that need to be saved and loaded
   */
  private models: any[] = [Agent, Room, Info, Item, Conversation, Trade];
  private actions: Action[] = [ActionLogin, ActionMoveToRoom];

  constructor(app?: express.Application) {
    this.createApp(app);
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

  /**
   * sends update payload to all changed models
   * @param updates Map of updates to send to an agent
   */
  // moved to controller
  // private updateModels(agent: Agent, updates: Set<IDObject>) {
  //   const payload = {};
  //   updates.forEach(model => {
  //     const name = model.constructor.name;
  //     if (!payload[name]) {
  //       payload[name] = [];
  //     }
  //     payload[name].push(JSON.stringify(model.serialize()));
  //   });
  //   console.log(payload);
  //   agent.socket.emit("updateModels", payload);
  // }

  /**
   * These are client -> server messages.
   * This file should not need to be modified. To add new events, create new
   * event files in models/events
   */
  private listen(): void {
    this.server.listen(this.port, () => {
      logger.log("Starting server on port " + this.port, LOG.INFO);
    });

    // Adds hook to set up all action hooks for each client
    this.io.on("connection", socket => {
      logger.log("Client Connected", LOG.INFO);

      for (const action of this.actions) {
        socket.on(action.name, (data, callback) => {
          logger.log("Action recieved.", 2);
          const agent = Agent.getAgentBySocket(socket);
          let res: ValidationResult;
          if ((res = Validate.validate_key_format(action.formats, data)).status) {
            res = action.validate(agent, socket, data);
            if (true || res.status) {
              res.status = true;
              action.enact(agent, data);
            }
          }
          callback(res);
        });
      }

      socket.on("disconnect", data => {
        logger.log("Client disconnected", LOG.INFO);
        const agent: Agent = Agent.getAgentBySocket(socket);
        if (agent !== undefined) {
          agent.logout();
        }
      });
    });
  }

  private loadModels() {
    util.makeDir(util.panoptykSettings.data_dir); // <- Should suffice
    this.models.forEach(model => {
      model.loadAll();
    });
  }

  private saveModels() {
    Agent.logoutAll();
    this.models.forEach(model => {
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
