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
import { Agent } from "../../agent";
import { Room } from "../../room";
import { Quest } from "../../quest";

export interface TAARQ extends TAAR {
    quest: Quest;
}

/**
 * Creates an action that uses this predicate format
 * TAARQ: predicate(Time, Agent, AgentB, Room, Quest)
 */
export class PredicateTAARQ extends PredicateBase {
    predicateName = "TAARQ";
    _terms: serializable<TAARQ>;

    constructor({ time, agent, agentB, room, quest }: TAARQ) {
        super();
        this._terms.time = time;
        this._terms.agent = agent ? agent.id : -1;
        this._terms.agentB = agentB ? agentB.id : -1;
        this._terms.room = room ? room.id : -1;
        this._terms.quest = quest ? quest.id : -1;
    }

    getTerms(
        mask?: metadata<TAARQ>,
        asQuery = false
    ): masked<TAARQ> | query<TAARQ> {
        const terms: TAARQ = {
            time: this._terms.time,
            agent: this.db.retrieveModel(this._terms.agent, Agent),
            agentB: this.db.retrieveModel(this._terms.agentB, Agent),
            room: this.db.retrieveModel(this._terms.room, Room),
            quest: this.db.retrieveModel(
                this._terms.quest,
                Quest
            ),
        };

        return PredicateBase.replaceTerms(
            terms,
            asQuery ? QUERY : MASKED,
            mask
        );
    }
}
