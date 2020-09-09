import { logger, LOG } from "../utilities/logger";
import * as util from "../utilities/util";
import {
  IDObject,
  Agent,
  Conversation,
  Trade,
  Room,
  Item,
  Info,
  Quest,
  Faction,
  IModel,
  BaseModel
} from "../models/index";

export class BaseController {
  _updates: Map<Agent, Set<IModel>>;
  get updates(): Map<Agent, Set<IModel>> {
    return this._updates;
  }

  constructor(masterController?: BaseController) {
    if (masterController) {
      this._updates = masterController._updates;
    } else {
      this._updates = new Map<Agent, Set<IModel>>();
    }
  }

  updateChanges(agent: Agent, models: (IModel | IModel [])[]) {
    let updates = new Set<IModel>();
    if (this._updates.has(agent)) {
      updates = this._updates.get(agent);
    }
    for (const change of models) {
      if (!Array.isArray(change)) {
        this.addChange(updates, change);
      }
      // sometimes we will have arrays of changes in models
      else {
        for (const item of change) {
          this.addChange(updates, item);
        }
      }
    }
    this._updates.set(agent, updates);
  }

  /**
   * Makes sure that anything mentioned in an Info item is also sent
   * @param updates
   * @param change
   */
  addChange(updates: Set<IModel>, change: any) {
    updates.add(change);
    if (change instanceof Info) {
      // const terms = change.getTerms();
      // for (const term in terms) {
      //   if (terms[term] instanceof BaseModel) {
      //     this.addChange(updates, terms[term]);
      //   }
      // }
    } else if (change instanceof Agent) {
      // automatically give faction information of agents for now
      if (change.faction) {
        updates.add(change.faction);
      }
    }
  }

  /**
   * sends update payload to all changed models
   * @param updates Map of updates to send to an agent
   */
  sendUpdates() {
    for (const [agent, models] of this._updates) {
      const payload = {};
      for (const model of models) {
        const name = model.constructor.name;
        if (!payload[name]) {
          payload[name] = [];
        }
        if (name === Info.name) {
          // const info: Info = model as Info;
          // payload[name].push(info.toJSON(true, agent));
          // if (info.isReference()) {
          //   const master: Info = Info.getByID(info.id);
          //   payload[name].push(master.toJSON(true, agent));
          // }
        } else {
          payload[name].push(model.toJSON(true, agent));
        }
      }
      // console.log(payload);
      // if (agent.socket) { TODO: Figure out sockets
      //   agent.socket.emit("updateModels", payload);
      // }
    }
  }
}