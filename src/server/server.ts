import { logger, LOG } from "../core/utilities/logger";
import * as util from "../core/utilities/util";
import { Control } from "./controllers/controller";

import { IDObject } from "../../build/core/models/idObject";
import { Room } from "../core/models/room";
import { Agent } from "../core/models/agent";
import { Item } from "../core/models/item";
import { Info } from "../core/models/information";
import { Conversation } from "../core/models/conversation";
import { Trade } from "../core/models/trade";
import { Validate } from "../core/models/validate";

// Quick list of all models that need to be saved and loaded
const models: any[] = [Agent, Room, Item, Info, Conversation, Trade];
const saveAll = function() {
  models.forEach(m => {
    m.saveAll();
  });
};
const loadAll = function() {
  models.forEach(m => {
    m.loadAll();
  });
};

// Main server function
const main = function() {
  // Sets up "ctrl + c" to stop server
  process.on("SIGINT", () => {
    logger.log("Shutting down", LOG.INFO);

    saveAll();

    logger.log("Server closed", LOG.INFO);
    process.exit(0);
  });
};

// Starts server
main();
