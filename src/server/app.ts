import express = require("express");

const app: express.Application = express();

// Anything to do with the express app server of panoptyk
// Mostly includes creating paths to certain html/js client files

app.use("/public/game", express.static(process.cwd() + "/public/game"));
app.use("/assets", express.static(process.cwd() + "/public/game/assets"));

app.get("/test", function(req, res) {
  res.sendFile(process.cwd() + "/public/test.html");
});

app.get("/game", function(req, res) {
  res.sendFile(process.cwd() + "/public/game/index.html");
});

export default app;