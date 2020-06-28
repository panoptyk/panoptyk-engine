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
   * Provides json safe version of model for serialization and databasing
   * @param forClient Is the JSON for a connected client
   * @param context Additional context for use when creating the safe json
   */
  toJSON(forClient: boolean, context: any): object;
  /**
   * Load model data from json
   * @param json Json safe version of model
   */
  fromJSON(json: object): void;
  /**
   * In-game name of specfic model instance
   */
  displayName(): string;
  /**
   * Logging name of the specific model instance
   */
  toString(): string;
}