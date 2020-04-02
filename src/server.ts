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
  IDObject,
  Quest,
  Faction
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
  ActionReadyTrade,
  ActionAskQuestion,
  ActionOfferAnswerTrade,
  ActionWithdrawInfoTrade,
  ActionTellInfo,
  ActionPassQuestion,
  ActionGiveQuest,
  ActionRequestItemTrade,
  ActionPassItemRequest,
  ActionCloseQuest,
  ActionTurnInQuestInfo,
  ActionRejectTradeRequest,
  ActionRejectConversationRequest,
  ActionModifyAgentFaction,
  ActionModifyGoldTrade,
  ActionDropGold,
  ActionStealItem,
  ActionConfiscateItem,
  ActionTellItemOwnership,
  ActionArrestAgent,
  ActionInterrogateAgent,
  ActionRequestGoldTrade,
  ActionTellRewardQuest,
  ActionTurnInQuestItem,
  ActionRemoveItemRequest
} from "./models/action/index";
import { ValidationResult, Validate } from "./models/validate";

export class Server {
  private MIN_TIME_BETWEEN_ACTIONS = 100;
  private actingSockets: Map<socketIO.Socket, number> = new Map<
    socketIO.Socket,
    number
  >();
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
    Quest,
    Faction
  ];
  private actions: Action[] = [
    ActionLogin,
    ActionMoveToRoom,
    ActionRequestConversation,
    ActionDropItems,
    ActionOfferItemsTrade,
    ActionLeaveConversation,
    ActionRequestTrade,
    ActionCancelTrade,
    ActionTakeItems,
    ActionWithdrawItemsTrade,
    ActionReadyTrade,
    ActionAskQuestion,
    ActionOfferAnswerTrade,
    ActionWithdrawInfoTrade,
    ActionTellInfo,
    ActionPassQuestion,
    ActionCloseQuest,
    ActionTurnInQuestInfo,
    ActionGiveQuest,
    ActionRequestItemTrade,
    ActionPassItemRequest,
    ActionRejectTradeRequest,
    ActionRejectConversationRequest,
    ActionModifyAgentFaction,
    ActionModifyGoldTrade,
    ActionDropGold,
    ActionStealItem,
    ActionConfiscateItem,
    ActionTellItemOwnership,
    ActionArrestAgent,
    ActionInterrogateAgent,
    ActionRequestGoldTrade,
    ActionTellRewardQuest,
    ActionTurnInQuestItem,
    ActionRemoveItemRequest
  ];

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
      const settings = JSON.parse(
        fs.readFileSync("panoptyk-settings.json").toString()
      );
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
      util.panoptykSettings.server_start_date.month - 1, // Month is on a 0 to 11 scale
      util.panoptykSettings.server_start_date.day
    );
    logger.log("Panoptyk Settings:", LOG.INFO);
    for (const key in util.panoptykSettings) {
      logger.log(
        key + ": " + JSON.stringify(util.panoptykSettings[key]),
        LOG.INFO
      );
    }

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
          // Enforce action limit
          if (
            this.actingSockets.has(socket) &&
            Date.now() - this.actingSockets.get(socket) <
              this.MIN_TIME_BETWEEN_ACTIONS
          ) {
            callback({
              status: false,
              message:
                "You cannot act more than every " +
                this.MIN_TIME_BETWEEN_ACTIONS +
                " milliseconds!"
            });
            return;
          }
          this.actingSockets.set(socket, Date.now());

          // Process action
          logger.log("Action recieved: " + action.name, LOG.INFO);
          const agent = Agent.getAgentBySocket(socket);
          let res: ValidationResult;
          if (
            (res = Validate.validate_key_format(action.formats, data)).status &&
            (res = Validate.validate_factionType_requirement(
              action.requiredFactionType,
              agent
            )).status
          ) {
            res = action.validate(agent, socket, data);
            if (res.status) {
              action.enact(agent, data);
            } else {
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
          controller.logout(agent);
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
    this.models.forEach(model => {
      model.saveAll();
    });
  }

  public logoutAll() {
    const controller = new Controller();
    for (const key in Agent.objects) {
      const agent: Agent = Agent.objects[key];
      if (agent.socket) {
        controller.removeAgentFromRoom(agent, true);
      }
    }
  }

  public start() {
    this.loadModels();

    // Sets up "ctrl + c" to stop server
    process.on("SIGINT", () => {
      logger.log("Shutting down", LOG.INFO);
      this.logoutAll();
      this.saveModels();
      logger.log("Server closed", LOG.INFO);
      process.exit(0);
    });

    // Start http server
    this.listen();
  }
}
