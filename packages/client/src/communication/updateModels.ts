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
    for (const stringJSON of data[key]) {
      const model = Util.Deserialize.model(stringJSON, key);
      updates[key].push(model);
    }
  }
  return updates;
}
