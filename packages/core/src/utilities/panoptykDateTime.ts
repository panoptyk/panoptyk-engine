import AppContext from "./AppContext";

const DAYNAMES = [
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
];

export type panoptykTime = number;

export class PanoptykDate {
    /**
     * Dates are currently set to 1 IRL hour = 1 Panoptyk day
     * @param irl irl time in milliseconds
     */
    static toPanoptykTime(irl: number, offset = 0): panoptykTime {
        return Math.floor((irl - offset) * 24);
    }

    /**
     * Dates are currently set to 1 IRL hour = 1 Panoptyk day
     * @param pt panoptyk time in milliseconds
     */
    static toIRLTime(pt: panoptykTime, offset = 0) {
        return Math.floor(pt / 24) + offset;
    }

    /**
     * Dates are currently set to 1 IRL hour = 1 Panoptyk day
     * @param {number} offset offset in milliseconds for start of server (usually some past date in UTC ms)
     * @returns the number of milliseconds since the start of the Panoptyk server
     */
    static now(offset = -1): panoptykTime {
        // This will be the "Panoptyk Days" since midnight, January 1, 1970 so let's offset it
        const irlTime = Date.now();
        if (offset < 0) {
            offset = AppContext.settingsManager.settings.server_start_date_ms;
        }
        return PanoptykDate.toPanoptykTime(irlTime, offset);
    }

    /**
     * formats Panoptyk Time (in milliseconds) to year/day/hour/minutes
     * @param pt hours in panoptyk time
     */
    static format(pt: panoptykTime) {
        const minutes = Math.floor(pt / 60000);
        const hours = Math.floor(minutes / 60);
        const days = Math.floor(hours / 24);
        const dayNameNum = days % 7;
        return {
            year: Math.floor(days / 365),
            day: days % 365,
            hour: hours % 24,
            minute: minutes % 60,
            dayOfWeek: dayNameNum,
            dayName: DAYNAMES[dayNameNum],
        };
    }
}
