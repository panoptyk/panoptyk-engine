/**
 * These are client -> server messages.
 * This file should not need to be modified. To add new events, create new
 * event files in models/events
 */
server.modules.io.on('connection', function(socket) {
  server.log('Client Connected', 2);

  for (var event_index in server.models) {
    (function() {
      var event_key = event_index

      socket.on(server.models[event_key].event_name, function(data) {
        server.log("Event recieved.", 2);
        var evt = new server.models[event_key](socket, data);
      });
    })();
  }

  socket.on('disconnect', function() {
    var agent = server.models.Agent.get_agent_by_socket(socket);
    if (agent !== null) {
      agent.logout();
    }
  });
});
