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
import { TAARK } from "./predTAARK";
import { Agent } from "../../agent";
import { Room } from "../../room";
import { Information } from "../information";

export interface TAARKK extends TAARK {
    infoB: Information<PredicateTerms>;
}

/**
 * Creates an action that uses this predicate format
 * TAARK: predicate(Time, Agent, AgentB, Room, Information)
 */
export class PredicateTAARKK extends PredicateBase {
    predicateName = "TAARKK";
    _terms: serializable<TAARKK>;

    constructor({ time, agent, agentB, room, info, infoB }: TAARKK) {
        super();
        this._terms.time = time;
        this._terms.agent = agent ? agent.id : -1;
        this._terms.agentB = agentB ? agentB.id : -1;
        this._terms.room = room ? room.id : -1;
        this._terms.info = info ? info.id : -1;
        this._terms.infoB = infoB ? infoB.id : -1;
    }

    getTerms(
        mask?: metadata<TAARKK>,
        asQuery = false
    ): masked<TAARKK> | query<TAARKK> {
        const terms: TAARKK = {
            time: this._terms.time,
            agent: this.db.retrieveModel(this._terms.agent, Agent),
            agentB: this.db.retrieveModel(this._terms.agentB, Agent),
            room: this.db.retrieveModel(this._terms.room, Room),
            info: this.db.retrieveModel(
                this._terms.info,
                Information
            ),
            infoB: this.db.retrieveModel(
                this._terms.infoB,
                Information
            ),
        };

        return PredicateBase.replaceTerms(
            terms,
            asQuery ? QUERY : MASKED,
            mask
        );
    }
}
