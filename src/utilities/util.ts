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

// In the future you will want to change this to fake "Panoptyk" time.
// TODO: use a better date time function
export let getPanoptykDatetime = function() {
  return Date.now();
};

export let panoptykSettings = {
  "default_room_id": 1,
  "data_dir": "data",
  "port": 8080,
  "log_level": 2,
  "log_line_length": 99,
};