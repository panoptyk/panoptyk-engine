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
    this._objects.set(this.constructor, new Map());
    this._nextID.set(this.constructor, 1);
  }

  public static getNextID(): number {
    let id: number;

    if (!IDObject._nextID.has(this.constructor)) {
      IDObject._nextID.set(this.constructor, 1);
    }
    id = IDObject._nextID.get(this.constructor);
    IDObject._nextID.set(this.constructor, id + 1);

    return id;
  }

  public static get nextID() {
    return IDObject._nextID.get(this.constructor);
  }

  public static get objects(): Map<number, IDObject> {
    if (!IDObject._objects.has(this.constructor)) {
      IDObject._objects.set(this.constructor, new Map());
    }
    return IDObject._objects.get(this.constructor);
  }

  public static get fileName() {
    if (!IDObject._fileName.has(this.constructor)) {
      IDObject._fileName.set(this.constructor, this.name + ".json");
    }
    return IDObject._fileName.get(this.constructor);
  }

  public static set fileName(name: string) {
    IDObject._fileName.set(this.constructor, name);
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
        nextID: IDObject.nextID
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

    IDObject._nextID.set(this.constructor, json.nextID);
  }

  /**
   * Retrieve object by id
   * @param {number} id - object's id
   */
  static getByID(id: number) {
    return this.objects[id];
  }

  id?: number;

  constructor(id?) {
    this.id = id;
    if (!this.id) {
      this.id = IDObject.getNextID();
    }
    IDObject.objects[this.id] = this;
  }
}
