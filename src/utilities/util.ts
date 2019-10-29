import * as fs from "fs";

/**
 * Create a directory if it doesn't exist.
 * @param {string} dir - path to new directory
 */
export let makeDir = function(dir) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir);
  }
};


/**
 * Dates are currently set to 1 IRL hour = 1 Panoptyk day
 * @returns the number of hours since the start of the Panoptyk server
 */
export let getPanoptykDatetime = function(): number {
  // Dates are currently set to 1 IRL hour = 1 Panoptyk day
  // This will be the "Panoptyk Days" since midnight, January 1, 1970 so let's offset it
  const irlTime = Date.now();
  return Math.floor((irlTime - panoptykSettings.server_start_date_ms) / 150000);
};

const DAYNAMES = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday"
];

export let formatPanoptykDatetime = function(datetime: number) {
  const days = Math.floor(datetime / 24);
  const dayNameNum = days % 7;
  return {
    year: Math.floor(days / 365),
    day: days % 365,
    hour: datetime % 24,
    dayOfWeek: dayNameNum,
    dayName: DAYNAMES[dayNameNum]
  };
};

export let panoptykSettings = {
  "default_room_id": 1,
  "data_dir": "data",
  "port": 8080,
  "log_level": 2,
  "log_line_length": 99,
  "server_start_date": {
    day: 1,
    month: 1,
    year: 1970
  },
  "server_start_date_ms": 0
};