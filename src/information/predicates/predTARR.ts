import {
  MASKED,
  masked,
  metadata,
  query,
  QUERY,
  serializable,
} from "./IPredicate";
import { PredicateBase } from "./predBase";
import { TAR } from "./predTAR";
import { Agent, Room } from "../../models";

export interface TARR extends TAR {
  roomB: Room;
}

/**
 * Creates an action that uses this predicate format
 * TARR: predicate(Time, Agent, Room, RoomB)
 */
export class PredicateTARR extends PredicateBase {
  predicateName = "TARR";
  _terms: serializable<TARR>;

  constructor({ time, agent, room, roomB }: TARR) {
    super();
    this._terms.time = time;
    this._terms.agent = agent ? agent.id : -1;
    this._terms.room = room ? room.id : -1;
    this._terms.roomB = roomB ? roomB.id : -1;
  }

  getTerms(mask?: metadata<TARR>, asQuery = false): masked<TARR> | query<TARR> {
    const terms: TARR = {
      time: this._terms.time,
      agent: this.db.retrieveModel(this._terms.agent, Agent) as Agent,
      room: this.db.retrieveModel(this._terms.room, Room) as Room,
      roomB: this.db.retrieveModel(this._terms.roomB, Room) as Room
    };

    return PredicateBase.replaceTerms(terms, asQuery ? QUERY : MASKED, mask);
  }
}
