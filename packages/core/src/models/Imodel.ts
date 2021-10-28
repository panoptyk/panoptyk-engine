import AppContext from "../utilities/AppContext";
import { IDatabase } from "../database/IDatabase";

/**
 * Defines the necessary parameters and functions any Panoptyk game model needs.
 * To add new game models to a Panoptyk server, it must implement this interface.
 */
export interface IModel {
    /**
     * Unique ID number to identify specific models
     */
    id: number;
    /**
     * Database the model will use.
     */
    db: IDatabase;
    /**
     * Provides json safe*- version of model for serialization and databasing
     * @param forClient Is the JSON for a connected client
     * @param context Additional context for use when creating the safe json
     * @returns The json safe* version of the model.
     */
    toJSON(forClient: boolean, context: any): object;
    /**
     * Load model data from json
     * @param json Json safe* version of model
     */
    fromJSON(json: any): void;
    /**
     * checks if two models are the same
     * @param model model to check for equality
     */
    equals(model: any): boolean;
    /**
     * In-game name of specfic model instance
     */
    displayName(): string;
    /**
     * Logging name of the specific model instance
     */
    toString(): string;
}

/**
 * Defines type that can be any model class implementing IModel.
 */
export type modelRefGeneric<T extends IModel> = new (...args: any[]) => T;
export type modelRef = modelRefGeneric<IModel>;

/**
 * Useful starter class for new model.
 * Does not need to be used.
 */
export abstract class BaseModel implements IModel {
    id: number;
    db: IDatabase;

    constructor(id?: number, db?: IDatabase) {
        this.db = db ?? AppContext.db;
        this.id = id ?? this.db.getNextID(this.constructor as any);

        this.db.storeModel(this);
    }

    toJSON(forClient: boolean, context: any): object {
        const safeCopy = Object.assign({}, this);
        delete safeCopy.db;
        return safeCopy;
    }
    fromJSON(json: any): void {
        if (json.id && json.id !== this.id) {
            return;
        }
        for (const key in json) {
            if (json[key] !== undefined) {
                this[key] = json[key];
            }
        }
    }
    equals(model: any) {
        return this === model;
    }
    abstract displayName(): string;
    abstract toString(): string;
}
