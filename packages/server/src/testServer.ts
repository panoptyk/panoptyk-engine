import { Util, MemoryDatabase } from "@panoptyk/core";
import { Server } from "./server";

Util.inject.db = new MemoryDatabase();

const server = new Server();

function clock() {
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
  setTimeout(clock, 200 + Math.random() * 50);
}

server.start();
clock();