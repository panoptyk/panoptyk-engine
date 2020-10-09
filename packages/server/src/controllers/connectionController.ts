import { Socket } from "socket.io";
import { Util, Agent, Room } from "@panoptyk/core";
import { BaseController } from "./baseController";
import { SpawnController } from "./spawnController";
import { socketAgentMap } from "./../util";

export class ConnectionController extends BaseController {

    login(username: string, socket: Socket): boolean {
        const agents: Agent[] = Util.inject.db.matchModel({ _agentName: username }, Agent) as Agent[];

        let agent: Agent = undefined;
        if (agents.length === 1) {
            agent = agents[0];
        } else if (agents.length === 0) {
            agent = this.createAgent(username);
        } else {
            return false;
        }

        // store agent's socket
        socketAgentMap.registerAgentSocket(socket, agent);

        const sc: SpawnController = new SpawnController(this);

        this.updateChanges(agent, [agent.inventory, agent.knowledge, agent.activeAssignedQuests, agent.activeGivenQuests]);
        if (agent.faction) {
            this.updateChanges(agent, [ agent.faction ]);
        }

        // Assign login room to agent
        agent.room = Util.inject.db.retrieveModel(Util.inject.settingsManager.settings.default_room_id, Room) as Room;

        sc.spawnAgent(agent, agent.room);

        Util.logger.log(
            agent + " logged in",
            "CONTROL",
            Util.LOG.INFO
        );

        return true;
    }

    logout(agent: Agent) {
        const sc: SpawnController = new SpawnController(this);

        sc.despawnAgent(agent, agent.room);
    }

    createAgent(name: string): Agent {
        const agent: Agent = new Agent(name);
        return agent;
    }

}