import fs = require("fs");
import express = require("express");
import { logger, LOG } from "../core/utilities/logger";
import * as util from "../core/utilities/util";
import { Controller } from "../core/controllers/controller";
import { IDObject } from "../core/models/idObject";
import { Room } from "../core/models/room";
import { Agent } from "../core/models/agent";
import { Item } from "../core/models/item";
import { Info } from "../core/models/information";
import { Conversation } from "../core/models/conversation";
import { Trade } from "../core/models/trade";
import { Validate } from "../core/models/validate";
import * as modules from "../core/models/events/index";
const path = require("path");

const app: express.Application = express();

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

const fileServerStart = function() {
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
};

const start = function() {
  // Load all models
  util.makeDir(util.panoptykSettings.data_dir); // <- Should suffice
  loadAll();
  logger.log("Server models loaded", LOG.INFO);

  // Sets up "ctrl + c" to stop server
  process.on("SIGINT", () => {
    logger.log("Shutting down", LOG.INFO);

    saveAll();

    logger.log("Server closed", LOG.INFO);
    process.exit(0);
  });

  fileServerStart();

};

start();
