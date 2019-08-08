import { logger, LOG } from "../core/utilities/logger";
import * as util from "../core/utilities/util";
import { Control } from "./controllers/controller";
import fs = require("fs");
import { IDObject } from "../../build/core/models/idObject";
import { Room } from "../core/models/room";
import { Agent } from "../core/models/agent";
import { Item } from "../core/models/item";
import { Info } from "../core/models/information";
import { Conversation } from "../core/models/conversation";
import { Trade } from "../core/models/trade";
import { Validate } from "../core/models/validate";
import express = require("express");
import * as modules from "../core/models/events/index";
const path = require("path");

const app: express.Application = express();

app.use("/public/game", express.static(__dirname + "/public/game"));

// app.get("/test", function(req, res) {
//   res.sendFile(__dirname + "/public/test.html");
// });

// app.get("/game", function(req, res) {
//   res.sendFile(__dirname + "/public/game/game.html");
// });

app.listen(process.env.PORT || util.panoptykSettings.port, function() {
  logger.log("Starting server on port " + util.panoptykSettings.port, 2);
});

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

util.makeDir(util.panoptykSettings.data_dir);
util.makeDir(util.panoptykSettings.data_dir + "/agents");
util.makeDir(util.panoptykSettings.data_dir + "/rooms");
util.makeDir(util.panoptykSettings.data_dir + "/items");
util.makeDir(util.panoptykSettings.data_dir + "/info");
util.makeDir(util.panoptykSettings.data_dir + "/conversations");
util.makeDir(util.panoptykSettings.data_dir + "/trades");

// Sets up "ctrl + c" to stop server
process.on("SIGINT", () => {
  logger.log("Shutting down", LOG.INFO);

  saveAll();

  logger.log("Server closed", LOG.INFO);
  process.exit(0);
});