import { BaseController } from "./baseController";
import { Agent, Room } from "../models";
import { SpawnController } from "./spawnController";
import { Actions } from "../models/information";

export class MovementController extends BaseController {
  moveAgent(agent: Agent, from: Room, to: Room): void {
    if (!from.isConnectedTo(to)) {
      return;
    }

    const sc: SpawnController = new SpawnController(this);
    sc.despawnAgent(agent, from);
    sc.spawnAgent(agent, to);

    // Give info
    const info = Actions.moved({
      time: Date.now(),
      agent,
      room: to,
      roomB: from,
    });
    this.giveInfoToAgent(info, agent);
    this.disperseInfo(info, to);
    this.disperseInfo(info, from);
  }
}
