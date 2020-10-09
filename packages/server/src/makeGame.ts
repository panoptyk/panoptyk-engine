import {
  Util,
  Agent,
  Room,
  Item,
  Info,
  RoomManipulator,
  Actions,
} from "@panoptyk/core";
import { MemorySaveLoadDatabase } from "./database";

Util.inject.db = new MemorySaveLoadDatabase();
const db = Util.inject.db;

const r1 = new Room("town square", 10);
const r2 = new Room("north area", 10);
const r3 = new Room("south area", 10);
const r4 = new Room("east area", 10);
const r5 = new Room("west area", 10);

RoomManipulator.connectRooms(r1, r2);
RoomManipulator.connectRooms(r1, r3);
RoomManipulator.connectRooms(r1, r4);
RoomManipulator.connectRooms(r1, r5);

RoomManipulator.connectRooms(r2, r4);
RoomManipulator.connectRooms(r2, r5);
RoomManipulator.connectRooms(r3, r4);
RoomManipulator.connectRooms(r3, r5);

const i1 = new Item("thesis", "document", 1, r1);
const i2 = new Item("essay", "document", 1, r3);

const a1 = new Agent("Phil", r1);

const info = Actions.pickedup(
  { agent: a1, item: i1, room: i1.room, time: 123 },
  a1
);

db.save().finally(() => {
  console.log("save complete");
  const otherDB = new MemorySaveLoadDatabase();
  Util.inject.db = otherDB;
  otherDB.load().finally(() => {});
});
