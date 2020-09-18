import {
  MASKED,
  masked,
  metadata,
  PredicateTerms,
  query,
  QUERY,
  serializable,
} from "./IPredicate";
import { PredicateBase } from "./predBase";
import { TAAR } from "./predTAAR";
import { Agent, Room } from "../../models";
import { Information } from "../information";

export interface TAARK extends TAAR {
  info: Information<PredicateTerms>;
}

/**
 * Creates an action that uses this predicate format
 * TAARK: predicate(Time, Agent, AgentB, Room, Information)
 */
export class PredicateTAARK extends PredicateBase {
  predicateName = "TAARK";
  _terms: serializable<TAARK>;

  constructor({ time, agent, agentB, room, info }: TAARK) {
    super();
    this._terms.time = time;
    this._terms.agent = agent ? agent.id : -1;
    this._terms.agentB = agentB ? agentB.id : -1;
    this._terms.room = room ? room.id : -1;
    this._terms.info = info ? info.id : -1;
  }

  getTerms(mask?: metadata<TAARK>, asQuery = false): masked<TAARK> | query<TAARK> {
    const terms: TAARK = {
      time: this._terms.time,
      agent: this.db.retrieveModel(this._terms.agent, Agent) as Agent,
      agentB: this.db.retrieveModel(this._terms.agentB, Agent) as Agent,
      room: this.db.retrieveModel(this._terms.room, Room) as Room,
      info: this.db.retrieveModel(this._terms.info, Information) as Information<PredicateTerms>,
    };

    return PredicateBase.replaceTerms(terms, asQuery ? QUERY : MASKED, mask);
  }
}
