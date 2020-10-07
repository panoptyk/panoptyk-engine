import {
  Util,
  Agent,
  Room,
  Info,
  Information,
  Trade,
  Item,
  Conversation,
  Quest,
  Faction,
  IModel,
} from "@panoptyk/core";

const MODELS: any = {
  Agent,
  Room,
  Information,
  Item,
  Trade,
  Conversation,
  Quest,
  Faction,
};

export interface UpdatedModels {
  Information: Info[];
  Room: Room[];
  Agent: Agent[];
  Item: Item[];
  Trade: Trade[];
  Conversation: Conversation[];
  Quest: Quest[];
  Faction: Faction[];
}
// Corresponds to the given server's means to communicate model updates
export function updateModelsInMem(data): UpdatedModels {
  const updates: UpdatedModels = {
    Agent: [],
    Information: [],
    Item: [],
    Room: [],
    Trade: [],
    Conversation: [],
    Quest: [],
    Faction: [],
  };
  for (const key in data) {
    for (const modelJson of data[key]) {
      let model: IModel = undefined;
      // Update seen sets
      switch (key) {
        case "Agent":
          model = new Agent("", undefined, modelJson.id);
          model.fromJSON(modelJson);
          break;
        case "Information":
          model = new Information("", undefined, undefined, undefined, modelJson.id);
          model.fromJSON(modelJson);
          break;
        case "Item":
          model = new Item("", undefined, undefined, undefined, modelJson.id);
          model.fromJSON(modelJson);
          break;
        case "Room":
          model = new Room("", 1, modelJson.id);
          model.fromJSON(modelJson);
          break;
        case "Trade":
          model = new Trade(modelJson.id);
          model.fromJSON(modelJson);
          break;
        case "Conversation":
          model = new Conversation(undefined, modelJson.id);
          model.fromJSON(modelJson);
          break;
        case "Quest":
          model = new Quest(modelJson.id);
          model.fromJSON(modelJson);
          break;
        case "Faction":
          model = new Faction("", undefined, modelJson.id);
          model.fromJSON(modelJson);
          break;
        default:
          break;
      }
      updates[key].push(model);
    }
  }
  return updates;
}
