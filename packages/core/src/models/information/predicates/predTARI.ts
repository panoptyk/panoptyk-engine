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
import { Agent } from "../../agent";
import { Room } from "../../room";
import { Item } from "../../item";

export interface TARI extends TAR {
    item: Item;
}

/**
 * Creates an action that uses this predicate format
 * TARI: predicate(Time, Agent, Room, Item)
 */
export class PredicateTARI extends PredicateBase {
    predicateName = "TARI";
    _terms: serializable<TARI>;

    constructor({ time, agent, room, item }: TARI) {
        super();
        this._terms.time = time;
        this._terms.agent = agent ? agent.id : -1;
        this._terms.room = room ? room.id : -1;
        this._terms.item = item ? item.id : -1;
    }

    getTerms(
        mask?: metadata<TARI>,
        asQuery = false
    ): masked<TARI> | query<TARI> {
        const terms: TARI = {
            time: this._terms.time,
            agent: this.db.retrieveModel(this._terms.agent, Agent),
            room: this.db.retrieveModel(this._terms.room, Room),
            item: this.db.retrieveModel(this._terms.item, Item),
        };

        return PredicateBase.replaceTerms(
            terms,
            asQuery ? QUERY : MASKED,
            mask
        );
    }
}
