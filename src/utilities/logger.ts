import * as fs from "fs";

export class Logger {
  writeFile: fs.WriteStream;
  constructor(public logLevel = 2, private logLineLen = 99) {
    if (process.env.NODE_ENV !== "development") {
      this.setLogFile("log.txt");
    }
  }

  public static logLevels = {
    "-1": " CLIENT",
    "0": " ERROR ",
    "1": "WARNING",
    "2": "  INFO ",
    CLIENT: -1,
    ERROR: 0,
    WARNING: 1,
    INFO: 2
  };

  // DEPRECATED LOG CODE:
  // log(msg, logLevel = 0, file?) {
  //   if (logLevel <= this.logLevel) {
  //     const prefix = "[" + (new Date()).toISOString()
  //       .replace(/T/, " ").replace(/\..+/, "") + "]═["
  //       + Logger.logLevels[logLevel] + "]══";

  //     msg = prefix + (prefix.length + msg.length >= this.logLineLen ?
  //       "╦═╡ " : "══╡ ") + msg;

  //     msg = msg.replace(new RegExp("(.{" + this.logLineLen + "})", "g"),
  //       "$1\n                                 ╠══╡ ");

  //     const index = msg.lastIndexOf("╠");
  //     if (index > 0) {
  //       msg = msg.substr(0, index) + "╚" + msg.substr(index + 1);
  //     }

  //     if (file) {
  //       msg += " [" + file + "]";
  //     }
  //     console.log(msg);
  //   }
  // }

  /**
   * Log a message at specified important level.
   * @param {string} msg - message to log.
   * @param {int} logLevel - level of message importance.
   */
  public log(msg, logLevel = 0, file?: string) {
    if (logLevel <= this.logLevel) {
      const prefix =
        "[" + new Date() + "]═[" + Logger.logLevels[logLevel] + "]\t";
      const fullMsg = prefix + msg;
      if (fs.appendFileSync && file) {
        fs.appendFileSync(file, fullMsg + "\n");
      } else if (this.writeFile) {
        this.writeFile.write(fullMsg + "\n");
      } else {
        console.log(prefix + msg);
      }
    }
  }

  public clientLog(msg, file?: string) {
    this.log(msg, Logger.logLevels.CLIENT, file);
  }

  // TODO: add ability to change settings & load from settings.json file
  public silence(andClient = false) {
    this.logLevel = andClient ? -2 : -1;
  }

  public setLogFile(file: string) {
    if (!(fs.createWriteStream)) {
      return;
    }
    if (this.writeFile) {
      this.writeFile.close();
    }
    this.writeFile = fs.createWriteStream(file, { flags: "a" });
  }
}

export let logger = new Logger();
export const LOG = Logger.logLevels;
