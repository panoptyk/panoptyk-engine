import * as fs from "fs";
import * as util from "./utilities/util";
import express from "express";
import http from "http";
import socketIO from "socket.io";
import { Controller } from "./controllers/controller";
import { logger, LOG } from "./utilities/logger";
import {
  Agent,
  Room,
  Info,
  Item,
  Conversation,
  Trade,
  IDObject
} from "./models/index";
import {
  Action,
  ActionLogin,
  ActionMoveToRoom,
  ActionRequestConversation,
  ActionLeaveConversation,
  ActionRequestTrade,
  ActionCancelTrade,
  ActionTakeItems,
  ActionDropItems,
  ActionOfferItemsTrade,
  ActionWithdrawItemsTrade,
  ActionReadyTrade
} from "./models/action/index";
import { ValidationResult, Validate } from "./models/validate";

export class Server {
  private app: express.Application;
  private server: http.Server;
  private io: socketIO.Server;
  private port: string | number;

  /**
   * List of all models that need to be saved and loaded
   */
  private models: any[] = [Agent, Room, Info, Item, Conversation, Trade];
  private actions: Action[] = [ActionLogin, ActionMoveToRoom, ActionRequestConversation, ActionDropItems, ActionOfferItemsTrade,
    ActionLeaveConversation, ActionRequestTrade, ActionCancelTrade, ActionTakeItems, ActionWithdrawItemsTrade, ActionReadyTrade];

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
    // Calc UTC offset(ms)
    util.panoptykSettings.server_start_date_ms = Date.UTC(
      util.panoptykSettings.server_start_date.year,
      util.panoptykSettings.server_start_date.month,
      util.panoptykSettings.server_start_date.day
    );

    // Assign port
    this.port = util.panoptykSettings.port;
  }

  private sockets(): void {
    this.io = socketIO(this.server);
  }

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
          logger.log("Action recieved: " + action.name, LOG.INFO);
          const agent = Agent.getAgentBySocket(socket);
          let res: ValidationResult;
          if ((res = Validate.validate_key_format(action.formats, data)).status) {
            res = action.validate(agent, socket, data);
            if (res.status) {
              action.enact(agent, data);
            }
            else {
              logger.log("Action failed to validate: " + res.message, LOG.INFO);
            }
          }
          callback(res);
        });
      }

      socket.on("disconnect", data => {
        logger.log("Client disconnected", LOG.INFO);
        const agent: Agent = Agent.getAgentBySocket(socket);
        if (agent !== undefined) {
          const controller = new Controller();
          controller.removeAgentFromRoom(agent, true);
          controller.sendUpdates();
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
