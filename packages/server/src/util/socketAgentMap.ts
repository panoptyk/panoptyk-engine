import { Socket } from "socket.io";
import { Agent, Util } from "@panoptyk/core";

export class SocketAgentMap {
  //#region Singleton
  static _instance: SocketAgentMap;
  static get instance(): SocketAgentMap {
    if (!SocketAgentMap._instance) {
      SocketAgentMap._instance = new SocketAgentMap();
    }
    return SocketAgentMap._instance;
  }
  private constructor() {};
  //#endregion

  //#region Fields
  _socketAgent = new Map<Socket, number>();
  _agentSocket = new Map<number, Socket>();
  //#endregion

  registerAgentSocket(socket: Socket, agent: Agent) {
    if (agent && agent.id) {
      this._socketAgent.set(socket, agent.id);
      this._agentSocket.set(agent.id, socket);
    }
  }

  removeAgentSocket(socket: Socket, agent: Agent) {
    this._socketAgent.delete(socket);
    if (agent && agent.id) {
      this._agentSocket.delete(agent.id);
    }
  }

  getAgentFromSocket(socket: Socket): Agent {
    try {
      return Util.AppContext.db.retrieveModel(
        this._socketAgent.get(socket),
        Agent
      ) as Agent;
    } catch (err) {}
    return undefined;
  }

  getSocketFromAgent(agent: Agent): Socket {
    try {
      return this._agentSocket.get(agent.id);
    } catch (err) {}
    return undefined;
  }
}

export default SocketAgentMap.instance;
