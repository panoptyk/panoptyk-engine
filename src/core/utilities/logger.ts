class Logger {

  public static logLevels = {
    "0": " ERROR ",
    "1": "WARNING",
    "2": "  INFO ",
    ERROR: 0,
    WARNING: 1,
    INFO: 2,
  };

  constructor(public logLevel = 2, private logLineLen = 99) {

  }

  /**
   * Log a message at specified important level.
   * @param {string} msg - message to log.
   * @param {int} logLevel - level of message importance.
   */
  log(msg, logLevel = 0, file?) {
    if (logLevel <= this.logLevel) {
      const prefix = "[" + (new Date()).toISOString()
        .replace(/T/, " ").replace(/\..+/, "") + "]═["
        + Logger.logLevels[logLevel] + "]══";

      msg = prefix + (prefix.length + msg.length >= this.logLineLen ?
        "╦═╡ " : "══╡ ") + msg;

      msg = msg.replace(new RegExp("(.{" + this.logLineLen + "})", "g"),
        "$1\n                                 ╠══╡ ");

      const index = msg.lastIndexOf("╠");
      if (index > 0) {
        msg = msg.substr(0, index) + "╚" + msg.substr(index + 1);
      }

      if (file) {
        msg += " [" + file + "]";
      }
      console.log(msg);
    }
  }
  // TODO: add ability to change settings & load from settings.json file
  public silence() {
    this.logLevel = -1;
  }
}

export let logger = new Logger();

export const LOG = Logger.logLevels;
