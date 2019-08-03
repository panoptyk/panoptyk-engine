import fs = require("fs");
import { panoptykSettings } from "../utilities/util";

export abstract class IDObject {
  private static _nextID = new Map<any, number>();
  private static _objects = new Map<any, Map<number, IDObject>>();
  private static _fileName = new Map<any, string>();

  /**
   * Be very CAREFUL!
   * This function clears the entire set of objects tracked by ID
   */
  public static purge() {
    this._objects.set(this.name, new Map());
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

  public static get objects(): Map<number, IDObject> {
    if (!IDObject._objects.has(this.name)) {
      IDObject._objects.set(this.name, new Map());
    }
    return IDObject._objects.get(this.name);
  }

  private static getObjectByName(name: string): Map<number, IDObject> {
    if (!IDObject._objects.has(name)) {
      IDObject._objects.set(name, new Map());
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
    fs.writeFileSync(
      panoptykSettings.data_dir + "/" + this.fileName,
      JSON.stringify({
        objects: this.objects,
        nextID: this.nextID
      })
    );
  }

  /**
   * Load all info from file into memory.
   */
  static loadAll() {
    const data = fs.readFileSync(
      panoptykSettings.data_dir + "/" + this.fileName
    );
    const json = JSON.parse(data.toString());
    for (const key in json.objects) {
      (this as any).load(json.objects[key]);
    }

    IDObject._nextID.set(this.name, json.nextID);
  }

  /**
   * Retrieve object by id
   * @param {number} id - object's id
   */
  static getByID(id: number) {
    return this.objects[id];
  }

  public id?: number;

  constructor(name: string, id?) {
    this.id = id;
    if (!this.id) {
      this.id = IDObject.getNextID(name);
    }
    IDObject.getObjectByName(name)[this.id] = this;
  }
}
