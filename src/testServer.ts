import { inject, logger, PanoptykDate } from "./utilities";
import { MemoryDatabase } from "./database/MemoryDatabase";
import { Server } from "./server";

inject.db = new MemoryDatabase();

const server = new Server();

function clock() {
  const time = PanoptykDate.format(PanoptykDate.now());
  logger.log(
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
