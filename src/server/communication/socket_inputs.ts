import { logger } from "../../core/utilities/logger";

const io: any = {};
const models: any = {};

/**
 * These are client -> server messages.
 * This file should not need to be modified. To add new events, create new
 * event files in models/events
 */
io.on("connection", function(socket) {
  logger.log("Client Connected", 2);

  for (const eventIndex in models) {
    (function() {
      const eventKey = eventIndex;

      socket.on(models[eventKey]._eventName, function(data) {
        logger.log("Event recieved.", 2);
        const evt = new models[eventKey](socket, data);
      });
    })();
  }

  socket.on("disconnect", function() {
    const agent = models.Agent.getAgentBySocket(socket);
    if (agent !== null) {
      agent.logout();
    }
  });
});
