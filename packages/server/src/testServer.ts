import { Util } from "@panoptyk/core";
import { MemorySaveLoadDatabase } from "./database/MemorySaveLoadDatabase";
import { Server } from "./server";

Util.AppContext.db = new MemorySaveLoadDatabase();

const server = new Server();

function testclock() {
  const time = Util.PanoptykDate.format(Util.PanoptykDate.now());
  Util.logger.log(
    "Current time in Panoptyk is: " +
      "year " +
      time.year +
      " day " +
      time.day +
      " " +
      time.hour +
      ":" +
      time.minute,
    "TIME"
  );
  // tslint:disable-next-line: ban
  setTimeout(testclock, 1000 + Math.random() * 500);
}

server.start();
// clock();
