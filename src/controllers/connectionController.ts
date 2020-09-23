import { Socket } from "socket.io";
import { logger, LOG, inject } from "../utilities";
import { BaseController } from "./baseController";
import { SpawnController } from "./spawnController";
import { Agent, Room } from "../models";

export class ConnectionController extends BaseController {

    login(username: string, socket: Socket): boolean {
        const agents: Agent[] = inject.db.matchModel({ _agentName: username }, Agent) as Agent[];

        let agent: Agent = undefined;
        if (agents.length === 1) {
            agent = agents[0];
        } else if (agents.length === 0) {
            agent = this.createAgent(username);
        } else {
            return false;
        }

        const sc: SpawnController = new SpawnController(this);

        this.updateChanges(agent, [ agent.inventory, agent.knowledge, agent.activeAssignedQuests, agent.activeGivenQuests]);
        if (agent.faction) {
            this.updateChanges(agent, [ agent.faction ]);
        }

        sc.spawnAgent(agent, agent.room);

        logger.log(
            agent + " logged in",
            "CONTROL",
            LOG.INFO
        );

        return true;
    }

    createAgent(name: string): Agent {
        const agent: Agent = new Agent(name);
        agent.room = inject.db.retrieveModel(inject.settingsManager.settings.default_room_id, Room) as Room;
        return agent;
    }

}