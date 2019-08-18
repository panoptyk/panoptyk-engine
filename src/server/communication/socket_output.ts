import { logger } from "../../core/utilities/logger";
import { Agent, IDObject } from "../../core/models/index";

export const sendUpdate = function(updates: Map<Agent, Set<IDObject>>) {
    for (const [agent, models] of updates) {
        logger.log("Sending model updates to " + Agent.name, 1);
        agent.socket.emit("model-updates", JSON.stringify(models));
    }
};