import { IModel, modelRef } from "../models/Imodel";

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
  getNextID(model: modelRef): number;
  /**
   * Retrive the model of the given type with the given ID.
   * @param id ID of the model to retrive.
   * @param model Type of the model to retrive.
   * @returns Model with matching ID
   */
  retrieveModel(id: number, model: modelRef): IModel;
  /**
   * Store the given model.
   * @param model Model to store.
   * @returns Was the store successful.
   */
  storeModel(model: IModel): boolean;

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
