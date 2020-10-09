import {
  Agent,
  Conversation,
  Trade,
  Room,
  Item,
  Info,
  Information,
  Quest,
  Faction,
  IModel,
  BaseModel,
  AgentManipulator,
  InformationManipulator,
  Predicates,
  Util,
} from "@panoptyk/core";
import { socketAgentMap } from "../util";

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

  updateChanges(agent: Agent, models: (IModel | IModel[])[]) {
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
  addChange(updates: Set<IModel>, change: IModel) {
    updates.add(change);
    if (change instanceof Information) {
      updates.add(change.getMasterCopy());
      // Include information terms if they are an IModel
      const terms = change.getTerms(true) as Predicates.PredicateTerms;
      for (const key in terms) {
        const term = terms[key];
        if (term instanceof Object) {
          this.addChange(updates, term);
        }
      }
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
        if (name === Information.name) {
          const info: Info = model as Info;
          payload[name].push(
            Util.SmartJSON.stringify(info.toJSON(true, { agent }))
          );
        } else {
          payload[name].push(
            Util.SmartJSON.stringify(model.toJSON(true, { agent }))
          );
        }
      }

      const socket = socketAgentMap.getSocketFromAgent(agent);
      if (socket) {
        socket.emit("updateModels", Util.SmartJSON.stringify(payload));
        Util.logger.log("Updates sent to agent: " + agent, "SEND");
      } else {
        // TODO: handle PROBLEM
        Util.logger.log("Couldn't send update to agent: " + agent, "SEND", Util.LOG.WARN);
      }
    }
  }

  //////////////////////////////////////////////////////////////////////////////
  //                 Info giving/dispersal                                   //
  // *located in base controller as its used everywhere                     //
  ///////////////////////////////////////////////////////////////////////////

  /**
   * gives every agent in a room their own copy of information
   * @param info master copy of information
   * @param room room of occupants to disperse info to
   */
  disperseInfo(info: Info, room: Room) {
    const occupants = room.occupants;
    occupants.forEach((agent) => {
      // could determine whether agent gets the info or partial...
      this.giveInfoToAgent(info, agent);
    });
  }

  /**
   * gives every agent their own copy of information with optional mask
   *  shortcut to give infor to multiple agents
   * @param info master copy of information
   * @param agents agents to recieve info
   * @param mask optional mask of the info given to ALL agents
   */
  giveInfoToAgents(
    info: Info,
    agents: Agent[],
    mask?: {
      action: boolean;
      predMetaData: Predicates.metadata<Predicates.PredicateTerms>;
    }
  ) {
    agents.forEach((agent) => {
      this.giveInfoToAgent(info, agent, mask);
    });
  }

  /**
   * gives agent their own copy of information with optional mask
   * @param info master copy of information
   * @param agent agent to recieve info
   * @param mask optional mask of the info given to agent
   */
  giveInfoToAgent(
    info: Info,
    agent: Agent,
    mask?: {
      action: boolean;
      predMetaData: Predicates.metadata<Predicates.PredicateTerms>;
    }
  ) {
    let existingCopy = info.getMasterCopy().getAgentCopy(agent);
    if (existingCopy) {
      // potentially consolidate a mask
      InformationManipulator.consolidateMask(existingCopy, mask);
    } else {
      // make a copy and give it
      const copy = info.getCopy(agent);
      InformationManipulator.setMask(copy, mask);
      AgentManipulator.addInfo(agent, copy);
      existingCopy = copy;
    }
    // hook to give agent any "embedded" info
    //  info in the predicate of this info
    const terms = existingCopy.getTerms(true);
    for (const key in terms) {
      const term = terms[key];
      if (term instanceof Information) {
        this.giveInfoToAgent(term, agent); // shouldn't have a mask
      }
    }
    // register info as change
    this.updateChanges(agent, [existingCopy]);
  }
}
