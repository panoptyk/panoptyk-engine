import { Socket } from "socket.io";
import { Util, Agent, Room, Faction } from "@panoptyk/core";
import { BaseController } from "./baseController";
import { SpawnController } from "./spawnController";
import { socketAgentMap } from "./../util";

export class ConnectionController extends BaseController {
    login(username: string, socket: Socket): boolean {
        const agents: Agent[] = Util.AppContext.db.matchModels(
            { _agentName: username },
            Agent
        );

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

        this.updateChanges(agent, [
            agent,
            agent.inventory,
            agent.knowledge,
            agent.activeAssignedQuests,
            agent.activeGivenQuests,
            agent.factions
        ]);

        // TODO: fix \/
        // Give agent references to all factions
        this.updateChanges(agent, [
            ...Util.AppContext.db.matchModels({}, Faction)
        ])
        // TODO: fix /\

        // Assign login room to agent
        agent.room = Util.AppContext.db.retrieveModel(
            Util.AppContext.settingsManager.settings.default_room_id,
            Room
        );

        sc.spawnAgent(agent, agent.room);

        Util.logger.log(agent + " logged in", "CONTROL", Util.LOG.INFO);

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
