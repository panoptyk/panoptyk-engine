import * as fs from "fs";

export class Logger {
  writeFile: fs.WriteStream;
  constructor(public logLevel = 2, private logLineLen = 99) {
    if (process.env.NODE_ENV !== "development") {
      this.setLogFile("log.txt");
    }
  }

  static logLevels = {
    "-1": " CLIENT",
    "0": " ERROR ",
    "1": "WARN",
    "2": "  INFO ",
    CLIENT: -1,
    ERROR: 0,
    WARN: 1,
    INFO: 2
  };

  /**
   * Log a message at specified important level.
   * @param {string} msg - message to log.
   * @param {int} logLevel - level of message importance.
   */
  public log(msg, tag = "", logLevel = 2, file?: string) {
    if (logLevel <= this.logLevel) {
      const prefix =
        "[" + new Date() + "][" + Logger.logLevels[logLevel] + "]\t[" + tag + "]\t";
      const fullMsg = prefix + msg;
      if (fs && fs.appendFileSync && file) {
        fs.appendFileSync(file, fullMsg + "\n");
      } else if (this.writeFile) {
        this.writeFile.write(fullMsg + "\n");
      } else {
        console.log(prefix + msg);
      }
    }
  }

  public clientLog(msg, tag = "", file?: string) {
    this.log(msg, tag, Logger.logLevels.CLIENT, file);
  }

  // TODO: add ability to change settings & load from settings.json file
  public silence(andClient = false) {
    this.logLevel = andClient ? -2 : -1;
  }

  public setLogFile(file: string) {
    if (!(fs && fs.createWriteStream)) {
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
