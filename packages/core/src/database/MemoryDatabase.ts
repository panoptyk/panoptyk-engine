import { IDatabase } from "./IDatabase";
import { modelRefGeneric, IModel } from "../models";

/**
 * In-memory database that does not retain its data between sessions
 * On process end, all data is lost; Good for unit tests
 */
export class MemoryDatabase implements IDatabase {
    //#region Fields
    _idMap: Map<string, number> = new Map();
    _models: Map<string, Map<number, IModel>> = new Map();
    //#endregion

    getNextID<T extends IModel>(model: modelRefGeneric<T>): number {
        if (!this._idMap.has(model.name)) {
            this._idMap.set(model.name, 1);
        }
        const id = this._idMap.get(model.name);
        this._idMap.set(model.name, id + 1);
        return id;
    }

    storeModel<T extends IModel>(model: T): boolean {
        if (!this._models.has(model.constructor.name)) {
            this._models.set(model.constructor.name, new Map<number, IModel>());
        }
        this._models.get(model.constructor.name).set(model.id, model);
        return true;
    }
    storeModels<T extends IModel>(models: T[]): boolean[] {
        const success: boolean[] = [];
        models.forEach((model) => {
            success.push(this.storeModel(model));
        });
        return success;
    }

    retrieveModel<T extends IModel>(id: number, model: modelRefGeneric<T>): T {
        try {
            return this._models.get(model.name).get(id) as T;
        } catch (error) {
            // console.log(error);
            return undefined;
        }
    }
    retrieveModels<T extends IModel>(ids: number[], model: modelRefGeneric<T>): T[] {
        const models: T[] = [];
        ids.forEach((id) => {
            models.push(this.retrieveModel(id, model));
        });
        return models;
    }

    init(): Promise<boolean> {
        this.load();
        return Promise.resolve(true);
    }
    save(): Promise<boolean> {
        return Promise.resolve(true);
    }
    load(): Promise<boolean> {
        return new Promise((resolve) => {
            resolve(true);
            return;
        });
    }
    matchModels<T extends IModel>(query: object, model: modelRefGeneric<T>): T[] {
        const matches: T[] = [];
        let models: T[];
        try {
            models = [...this._models.get(model.name).values()] as T[];
            models.forEach((m: T) => {
                let isMatch = true;
                for (const key in query) {
                    if (query[key] instanceof Object && query[key].equals) {
                        isMatch = isMatch && query[key].equals((m as any)[key]);
                    } else {
                        isMatch = isMatch && query[key] === (m as any)[key];
                    }
                }
                if (isMatch) {
                    matches.push(m);
                }
            });
        } catch (error) {}
        return matches;
    }
}
