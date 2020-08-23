import { BaseController } from "./baseController";
import { Agent, Room } from "../models";
import { AgentController, RoomController } from ".";

export class MovementController extends BaseController {

    moveAgent(agent: Agent, from: Room, to: Room): void {
        const ac: AgentController = new AgentController(this);
        const rc: RoomController = new RoomController(this);

        ac.removeFromRoom(agent, from);
        rc.removeAgent(from, agent);
        ac.putInRoom(agent, to);
        rc.addAgent(to, agent);
    }

}