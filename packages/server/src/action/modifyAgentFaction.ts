// import { Action } from "./action";
// import { logger } from "../utilities/logger";
// import { Validate } from "./validate";
// import { Controller } from "../../controllers/controller";
// import { Models.Agent, Faction } from "../models/index";

// export const ActionModifyModels.AgentFaction: Action = {
//   name: "modify-agent-faction",
//   formats: [
//     {
//       agentID: "number",
//       factionID: "number",
//       rank: "number"
//     }
//   ],
//   enact: (agent: Models.Agent, inputData: any) => {
//     const controller = new Controller();
//     const targetModels.Agent: Models.Agent = Models.Agent.getByID(inputData.agentID);
//     const agentFaction: Faction = Faction.getByID(inputData.factionID);
//     controller.modifyModels.AgentFaction(targetModels.Agent, agentFaction, inputData.rank);
//     logger.log("Event modify-agent-faction from (" + agent + ") targeting " + targetModels.Agent + " registered.", 2);

//     controller.sendUpdates();
//   },
//   validate: (agent: Models.Agent, socket: any, inputData: any) => {
//     let res;
//     if (!(res = Validate.validate_agent_logged_in(agent)).status) {
//       return res;
//     }
//     // TODO: add appropiate validation once factions are flushed out
//     return Validate.successMsg;
//   }
// };
