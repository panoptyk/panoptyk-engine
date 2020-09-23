import { BaseController } from "./baseController";
import { Agent } from "../models";
import { SpawnController } from "./spawnController";

export class ConnectionController extends BaseController {

    login(agent: Agent) {
        const sc: SpawnController = new SpawnController(this);

        this.updateChanges(agent, [ agent.inventory, agent.knowledge, agent.activeAssignedQuests, agent.activeGivenQuests]);
        if (agent.faction) {
            this.updateChanges(agent, [ agent.faction ]);
        }

        sc.spawnAgent(agent, agent.room);
    }

}