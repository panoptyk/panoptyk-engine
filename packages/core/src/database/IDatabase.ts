import { IModel, modelRefGeneric } from "../models/Imodel";

/**
 * Defines the necessary functions for a Panoptyk model database.
 * To use a custom database for Panoptyk, it must implement this interface.
 */
export interface IDatabase {
    /**
     * Get the next available ID for the given model.
     * @param model Model type to get the next ID for.
     * @returns Next available ID.
     */
    getNextID<T extends IModel>(model: modelRefGeneric<T>): number;
    /**
     * Retrive the model of the given type with the given ID.
     * @param id ID of the model to retrive.
     * @param model Type of the model to retrive.
     * @returns Model with matching ID.
     */
    retrieveModel<T extends IModel>(id: number, model: modelRefGeneric<T>): T;
    /**
     * Retrive a list of models with the given type from the given IDs.
     * @param id IDs of the models to retrive.
     * @param model Type of the models to retrive.
     * @returns List of models with matching IDs.
     */
    retrieveModels<T extends IModel>(ids: number[], model: modelRefGeneric<T>): T[];
    /**
     * Store the given model.
     * @param model Model to store.
     * @param modelType Type of the models to retrive.
     * @returns Was the store successful.
     */
    storeModel<T extends IModel>(model: T): boolean;
    /**
     * Store the given models.
     * @param model Models to store.
     * @param modelType Type of the models to retrive.
     * @returns Was the store successful.
     */
    storeModels<T extends IModel>(models: T[]): boolean[];

    /**
     *
     * @param query object with fields the returned models should match
     * @param model the ModelRef to match against (type of IModel)
     */
    matchModels<T extends IModel>(query: object, model: modelRefGeneric<T>): T[];

    // Normal database functions (async)
    /**
     * Place to initialize database
     * @returns Promise on success or failure
     */
    init(): Promise<boolean>;
    /**
     * Save/update stored models
     * @returns Promise on success or failure
     */
    save(): Promise<boolean>;
    /**
     * Load models between server startups
     * @returns Promise on success or failure
     */
    load(): Promise<boolean>;
}
