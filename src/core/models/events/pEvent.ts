import { Agent } from "../agent";

export abstract class PEvent {
    public time: Date;
    public fromAgent: Agent;
    constructor(socket, data) {
        this.time = new Date();
        this.fromAgent = Agent.getAgentBySocket(socket);
    }
}