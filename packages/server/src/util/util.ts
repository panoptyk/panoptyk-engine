import * as fs from "fs";
// TODO are these still valuable?

/**
 * Create a directory if it doesn't exist.
 * @param {string} dir - path to new directory
 */
export let makeDir = function (dir) {
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir);
    }
};

/**
 * Returns a random integer within [min, max)
 * @param min inclusive min
 * @param max exclusive max
 */
export let randomInt = function (min: number, max: number) {
    return Math.floor(Math.random() * (max - min)) + min;
};
