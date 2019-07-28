import fs = require("fs");

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
  const today = new Date();
  return today.getUTCSeconds();
};
