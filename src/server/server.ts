import { logger } from "../core/utilities/logger";
import { makeDir, getPanoptykDatetime, panoptykSettings }
from "../core/utilities/util";

import { Room } from "../core/models/room";
import { Agent } from "../core/models/agent";
import { Item } from "../core/models/item";
import { Info } from "../core/models/information";
import { Conversation } from "../core/models/conversation";
import { Trade } from "../core/models/trade";
import { Validate } from "../core/models/validate";

import { Control } from "./controllers/controller";



process.on("SIGINT", () => {
    logger.log("Shutting down", 2);

    Agent.saveAll();
    Room.saveAll();
    Item.saveAll();
    Info.saveAll();
    Conversation.saveAll();
    Trade.saveAll();

    logger.log("Server closed", 2);
    process.exit(0);
});

