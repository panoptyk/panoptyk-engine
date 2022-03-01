import {
    MASKED,
    masked,
    metadata,
    query,
    QUERY,
    serializable,
} from "./IPredicate";
import { PredicateBase } from "./predBase";
import { TAAR } from "./predTAAR";
import { Agent } from "../../agent";
import { Room } from "../../room";
import { Trade } from "../../trade";

export interface TAARD extends TAAR {
    trade: Trade;
}

/**
 * Creates an action that uses this predicate format
 * TAARK: predicate(Time, Agent, AgentB, Room, Item)
 */
export class PredicateTAARD extends PredicateBase {
    predicateName = "TAARD";
    _terms: serializable<TAARD>;

    constructor({ time, agent, agentB, room, trade }: TAARD) {
        super();
        this._terms.time = time;
        this._terms.agent = agent ? agent.id : -1;
        this._terms.agentB = agentB ? agentB.id : -1;
        this._terms.room = room ? room.id : -1;
        this._terms.trade = trade ? trade.id : -1;
    }

    getTerms(
        mask?: metadata<TAARD>,
        asQuery = false
    ): masked<TAARD> | query<TAARD> {
        const terms: TAARD = {
            time: this._terms.time,
            agent: this.db.retrieveModel(this._terms.agent, Agent),
            agentB: this.db.retrieveModel(this._terms.agentB, Agent),
            room: this.db.retrieveModel(this._terms.room, Room),
            trade: this.db.retrieveModel(this._terms.trade, Trade),
        };

        return PredicateBase.replaceTerms(
            terms,
            asQuery ? QUERY : MASKED,
            mask
        );
    }
}
