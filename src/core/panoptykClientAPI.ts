import * as io from "socket.io-client";
import { ValidationResult } from "./models/validate";
import { Agent, Room, Info, Trade, Item, Conversation } from "./models";

const MODELS: any = {
  Agent,
  Room,
  Info,
  Item,
  Trade,
  Conversation,
};

const emit = function(socket: SocketIOClient.Socket, event: string, payload: any): Promise<ValidationResult> {
  return new Promise((resolve, reject) => {
    socket.emit(event, payload, (result: ValidationResult) => {
      resolve(result);
    });
  });
};

export class ClientAPI {
  private static socket: SocketIOClient.Socket = undefined;
  private static initialized = false;
  private static actionSent = false;
  private static updating: boolean[] = [];
  private static playerAgentName = undefined;
  private static _playerAgent: Agent = undefined;
  public static get playerAgent(): Agent {
    // No name to use to find agent
    if (!ClientAPI.playerAgentName) {
      return undefined;
    }
    // Skip searching for player agent if already found
    if (ClientAPI._playerAgent && ClientAPI._playerAgent.agentName === ClientAPI.playerAgentName) {
      // Get latest verison of player
      return ClientAPI._playerAgent;
    }
    // Search for player agent
    return (ClientAPI._playerAgent = Agent.getAgentByName(ClientAPI.playerAgentName));
  }

  private static async sendWrapper(event: string, payload: any) {
    if (ClientAPI.initialized && ClientAPI.actionSent) {
      const res: ValidationResult = {
        status: false,
        message: "Please wait for action to complete!"
      };
      throw res;
    }
    ClientAPI.actionSent = true;
    const res = await emit(ClientAPI.socket, event, payload);
    ClientAPI.actionSent = false;
    if (res.status) {
        return res;
    }
    else {
        throw res.message;
    }
  }

  /**
   * Call init before using anything else in the ClientAPI
   * @param ipAddress address of panoptyk game server
   */
  public static init(ipAddress = "http://localhost:8080") {
    ClientAPI.socket = io.connect(ipAddress);
    // Sets up the hook to recieve updates on relevant models
    ClientAPI.socket.on("updateModels", data => {
      console.log("Model updates recieved");
      console.log(data);
      ClientAPI.updating.push(true);
      for (const key in data) {
        for (const model of data[key]) {
          MODELS[key].load(model);
        }
      }
      ClientAPI.updating.pop();
    });
    ClientAPI.initialized = true;
  }

  /**
   * Determins if a new action can be attempted at this time
   */
  public static canAct(): boolean {
    return !ClientAPI.actionSent && ClientAPI.updating.length === 0;
  }

  /**
   * Login action to log player back into the world
   * @param name username
   * @param password password (should be a hash eventually)
   */
  public static async login(name: string, password: string) {
    const res = await ClientAPI.sendWrapper("login", { username: name, password });
    ClientAPI.playerAgentName = name;
    return res;
  }

  /**
   * Assumes agent has logged into server
   * @param room room to move to
   * @param agent for admins move other agents around
   */
  public static async moveToRoom(room: Room, agent?: Agent) {
    agent = agent ? agent : ClientAPI._playerAgent;
    const res = await ClientAPI.sendWrapper("move-to-room", {roomID: room.id});
    return res;
  }
}
