import { maskof, serializable } from "./IPredicate";
import { PredicateBase } from "./predBase";
import { TAA } from "./predTAA";
import { Agent, Room } from "../../models";

export interface TAAR extends TAA {
  room: Room;
}

/**
 * Creates an action that uses this predicate format
 * TAAR: predicate(Time, Agent, AgentB, Room)
 */
export class PredicateTAAR extends PredicateBase {
  predicateName = "TAAR";
  _terms: serializable<TAAR>;

  constructor({ time, agent, agentB, room }: TAAR) {
    super();
    this._terms.time = time;
    this._terms.agent = agent ? agent.id : -1;
    this._terms.agentB = agentB ? agentB.id : -1;
    this._terms.room = room ? room.id : -1;
  }

  getTerms(mask?: maskof<TAAR>): TAAR {
    let terms: TAAR = {
      time: this._terms.time,
      agent: this.db.retrieveModel(this._terms.agent, Agent) as Agent,
      agentB: this.db.retrieveModel(this._terms.agentB, Agent) as Agent,
      room: this.db.retrieveModel(this._terms.room, Room) as Room
    };

    terms = PredicateBase.maskTerms(terms, mask);

    return terms;
  }
}
