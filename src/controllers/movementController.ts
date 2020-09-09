import { BaseController } from "./baseController";
import { Agent, Room } from "../models";
import { AgentManipulator, RoomManipulator } from "../manipulators";
import { SpawnController } from "./spawnController";

export class MovementController extends BaseController {

    moveAgent(agent: Agent, from: Room, to: Room): void {

        if (!from.isConnectedTo(to)) {
            return;
        }

        const sc: SpawnController = new SpawnController(this);
        sc.despawnAgent(agent, from);
        sc.spawnAgent(agent, to);
        // Give info -- Agent movement info

    }

}