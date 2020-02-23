import * as fs from "fs";
import { panoptykSettings } from "../utilities/util";
import { logger, LOG } from "../utilities/logger";
import { Agent } from "./agent";

interface ModelInterface {
  id?: number;
  serialize(agent?: Agent, removePrivateData?: boolean): any;
}

export abstract class IDObject implements ModelInterface {
  private static _nextID = new Map<string, number>();
  private static _objects = new Map<string, { [index: number]: any }>();
  private static _fileName = new Map<string, string>();

  /**
   * Be very CAREFUL!
   * This function clears the entire set of objects tracked by ID
   */
  public static purge() {
    this._objects.set(this.name, {});
    this._nextID.set(this.name, 1);
  }

  public static getNextID(name?: string): number {
    let id: number;
    const key = name ? name : this.name;

    if (!IDObject._nextID.has(key)) {
      IDObject._nextID.set(key, 1);
    }
    id = IDObject._nextID.get(key);
    IDObject._nextID.set(key, id + 1);

    return id;
  }

  public static get nextID() {
    return IDObject._nextID.get(this.name);
  }

  public static get objects(): { [index: number]: any } {
    if (!IDObject._objects.has(this.name)) {
      IDObject._objects.set(this.name, {});
    }
    return IDObject._objects.get(this.name);
  }

  private static getObjectByName(name: string): { [index: number]: any } {
    if (!IDObject._objects.has(name)) {
      IDObject._objects.set(name, {});
    }
    return IDObject._objects.get(name);
  }

  public static get fileName() {
    if (!IDObject._fileName.has(this.name)) {
      IDObject._fileName.set(this.name, this.name + ".json");
    }
    return IDObject._fileName.get(this.name);
  }

  public static set fileName(name: string) {
    IDObject._fileName.set(this.name, name);
  }

  public static getPath() {
    return panoptykSettings.data_dir + "/" + this.fileName;
  }

  /**
   * Serialize all info and save them to files.
   */
  static saveAll() {
    const data = {};
    for (const key in this.objects) {
      data[key] = this.objects[key].serialize();
    }
    fs.writeFileSync(
      panoptykSettings.data_dir + "/" + this.fileName,
      JSON.stringify({
        objects: data,
        nextID: this.nextID ? this.nextID : 1
      })
    );
  }

  /**
   * Load all info from file into memory.
   */
  static loadAll() {
    const path = panoptykSettings.data_dir + "/" + this.fileName;
    let data;
    try {
      data = fs.readFileSync(path);
    } catch (err) {
      logger.log("File " + path + " does not exist to load.", LOG.ERROR);
      return;
    }
    const json = JSON.parse(data.toString());
    for (const key in json.objects) {
      (this as any).load(json.objects[key]);
    }

    IDObject._nextID.set(this.name, json.nextID ? json.nextID : 1);
  }

  /**
   * Retrieve object by id
   * @param {number} id - object's id
   */
  static getByID(id: number): any {
    return this.objects[id];
  }

  static getByIDs(ids: number[]) {
    const objects = [];
    for (const id of ids) {
      const object = this.objects[id];
      if (object === undefined) {
        logger.log("Could not find " + this.name + " for id " + id + ".", 0);
      }
      else {
        objects.push(object);
      }
    }
    return objects;
  }

  public id?: number;

  constructor(name: string, id?) {
    this.id = id;
    if (!this.id) {
      this.id = IDObject.getNextID(name);
    }
    IDObject.getObjectByName(name)[this.id] = this;
  }

  public serialize(agent?: Agent, removePrivateData = false): any {
    return this;
  }
}
