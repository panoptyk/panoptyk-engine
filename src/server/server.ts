import fs = require("fs");
import express = require("express");
import { logger, LOG } from "../core/utilities/logger";
import * as util from "../core/utilities/util";
import { Controller } from "../core/controllers/controller";
import { IDObject } from "../core/models/idObject";
import { Validate } from "../core/models/validate";
import * as models from "../core/models/index";
import * as events from "../core/models/events/index";

// Quick list of all models that need to be saved and loaded
const app: express.Application = express();
const http = require("http").Server(app);
const io = require("socket.io")(http);

util.makeDir(util.panoptykSettings.data_dir); // <- Should suffice
for (const model in models) {
  models[model].loadAll();
}
logger.log("Server models loaded", LOG.INFO);

// Sets up "ctrl + c" to stop server
process.on("SIGINT", () => {
    logger.log("Shutting down", LOG.INFO);
    for (const model in models) {
      models[model].saveAll();
    }
    logger.log("Server closed", LOG.INFO);
    process.exit(0);
});

app.use("/public/game", express.static(__dirname + "/public/game"));

app.get("/test", function(req, res) {
  res.sendFile(__dirname + "/public/test.html");
});

app.get("/game", function(req, res) {
  res.sendFile(__dirname + "/public/game/game.html");
});

const server = app.listen(process.env.PORT || util.panoptykSettings.port, () => {
    logger.log("Starting server on port " + util.panoptykSettings.port, 2);
});

export { app, io, models, server };