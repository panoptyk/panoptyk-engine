server = {};

server.modules = {};
server.modules.express = require('express');
server.modules.app = server.modules.express();
server.modules.server = require('http').Server(server.modules.app);
server.modules.io = require('socket.io').listen(server.modules.server);
server.modules.fs = require('fs');

server.settings = require(__dirname + '/panoptyk-settings.json');

require(__dirname + '/utilities/logger.js');
require(__dirname + '/utilities/directory.js');
require(__dirname + '/utilities/time.js');
require(__dirname + '/communication/socket_inputs.js');
require(__dirname + '/communication/socket_outputs.js');

server.models = {};

server.models.Room = require(__dirname + '/models/room.js');
server.models.Agent = require(__dirname + '/models/agent.js');
server.models.Item = require(__dirname + '/models/item.js');
server.models.Info = require(__dirname + '/models/information.js');
server.models.Conversation = require(__dirname + '/models/conversation.js');
server.models.Trade = require(__dirname + '/models/trade.js');

server.control = require(__dirname + '/controllers/controller.js');

server.models.Validate = require(__dirname + '/models/validate.js');
server.modules.fs.readdirSync(__dirname + '/models/events/').forEach(function(file) {
  require(__dirname + '/models/events/' + file);
});

server.modules.app.use('/public/game', server.modules.express.static(__dirname + '/public/game'));

server.modules.app.get('/test', function(req, res) {
  res.sendFile(__dirname + '/public/test.html');
});

server.modules.app.get('/game', function(req, res) {
  res.sendFile(__dirname + '/public/game/game.html');
});

server.modules.server.listen(process.env.PORT || server.settings.port, function() {
  server.log('Starting server on port ' + server.modules.server.address().port, 2);
});

process.on('SIGINT', () => {
  server.log("Shutting down", 2);

  server.models.Agent.save_all();
  server.models.Room.save_all();
  server.models.Item.save_all();
  server.models.Info.save_all();
  server.models.Conversation.save_all();
  server.models.Trade.save_all();

  server.log("Server closed", 2);
  process.exit(0);
});

server.directory.make(server.settings.data_dir);
server.directory.make(server.settings.data_dir + '/agents');
server.directory.make(server.settings.data_dir + '/rooms');
server.directory.make(server.settings.data_dir + '/items');
server.directory.make(server.settings.data_dir + '/info');
server.directory.make(server.settings.data_dir + '/conversations');
server.directory.make(server.settings.data_dir + '/trades');

server.models.Room.load_all();
server.models.Agent.load_all();
server.models.Item.load_all();
server.models.Info.load_all();
server.models.Conversation.load_all();
server.models.Trade.load_all();
