import {
    MASKED,
    masked,
    metadata,
    query,
    QUERY,
    serializable,
} from "./IPredicate";
import { PredicateBase } from "./predBase";
import { TA } from "./predTA";
import { Agent } from "../../agent";
import { Room } from "../../room";

export interface TAR extends TA {
    room: Room;
}

/**
 * Creates an action that uses this predicate format
 * TAR: predicate(Time, Agent, Room)
 */
export class PredicateTAR extends PredicateBase {
    predicateName = "TAR";
    _terms: serializable<TAR>;

    constructor({ time, agent, room }: TAR) {
        super();
        this._terms.time = time;
        this._terms.agent = agent ? agent.id : -1;
        this._terms.room = room ? room.id : -1;
    }

    getTerms(mask?: metadata<TAR>, asQuery = false): masked<TAR> | query<TAR> {
        const terms: TAR = {
            time: this._terms.time,
            agent: this.db.retrieveModel(this._terms.agent, Agent),
            room: this.db.retrieveModel(this._terms.room, Room),
        };

        return PredicateBase.replaceTerms(
            terms,
            asQuery ? QUERY : MASKED,
            mask
        );
    }
}
