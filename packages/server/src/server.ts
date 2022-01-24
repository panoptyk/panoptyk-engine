import * as fs from "fs";
import http from "http";
import express from "express";
import socketIO from "socket.io";
import { Util, Agent } from "@panoptyk/core";
import { socketAgentMap } from "./util";
import {
    Action,
    ActionLogin,
    ActionMoveToRoom,
    ActionRequestConversation,
    ActionLeaveConversation,
    ActionTakeItems,
    ActionDropItems,
    ActionRejectConversationRequest,
    ActionJoinConversation,
    ActionTellInfo,
    ActionAskQuestion,
    ActionGiveQuest,
    ActionTurnInQuestInfo,
    ActionRequestTrade,
    ActionRejectTradeRequest,
    ActionOfferItemsTrade,
    ActionReadyTrade,
    ActionOfferAnswerTrade,
} from "./action";
import * as Validate from "./validate";
import { ConnectionController } from "./controllers";

const logger = Util.logger;
const LOG = Util.LOG;

const defaultActions: Action[] = [
    ActionLogin,
    ActionMoveToRoom,
    ActionDropItems,
    ActionTakeItems,
    ActionRequestConversation,
    ActionRejectConversationRequest,
    ActionJoinConversation,
    ActionLeaveConversation,
    ActionTellInfo,
    ActionAskQuestion,
    ActionGiveQuest,
    ActionTurnInQuestInfo,
    ActionRequestTrade,
    ActionRejectTradeRequest,
    ActionOfferItemsTrade,
    ActionReadyTrade,
    ActionOfferAnswerTrade,
];

const MIN_TIME_BETWEEN_ACTIONS = 100; // in ms

export class Server {
    _timeBetweenActions = MIN_TIME_BETWEEN_ACTIONS;
    get timeBetweenActions() {
        return this._timeBetweenActions;
    }
    set timeBetweenActions(t: number) {
        this._timeBetweenActions = t;
    }
    _timeSinceLastMsg: Map<socketIO.Socket, number> = new Map<
        socketIO.Socket,
        number
    >();
    _app: express.Application;
    _server: http.Server;
    _io: socketIO.Server;
    _port: string | number;

    _actions: Action[] = [];

    constructor(app?: express.Application) {
        this._actions = defaultActions;
        this._createApp(app);
        this._loadConfig();
        this._createServer();
        this._makeSockets();
    }

    _createApp(app?: express.Application): void {
        this._app = app ? app : express();
    }

    _createServer(): void {
        this._server = http.createServer(this._app);
    }

    _makeSockets(): void {
        this._io = socketIO(this._server);
    }

    _loadConfig(): void {
        const settingsM = Util.AppContext.settingsManager;
        // Read settings
        try {
            const json = JSON.parse(
                fs.readFileSync("panoptyk-settings.json").toString()
            );
            settingsM.setSettings(json);
            logger.log("# Panoptyk settings loaded...", "SERVER");
        } catch (err) {
            logger.log(
                "# No panoptyk settings found... creating one.",
                "SERVER"
            );
            fs.writeFileSync(
                "panoptyk-settings.json",
                JSON.stringify(Util.PanoptykSettings.default)
            );
        }

        // Report settings
        logger.log("# Panoptyk Settings:", "SERVER");
        for (const key in settingsM.settings) {
            logger.log(
                "# " + key + ": " + JSON.stringify(settingsM.settings[key]),
                "SERVER"
            );
        }
    }

    /**
     * These are client -> server messages.
     * This file should not need to be modified. To add new events, create new
     * event files in models/events
     */
    _listen(): void {
        // Assign port
        this._port = Util.AppContext.settingsManager.settings.port;

        this._server.listen(this._port, () => {
            logger.log("Starting server on port " + this._port, "SERVER");
        });

        // Adds hook to set up all action hooks for each client
        this._io.on("connection", (socket) => {
            logger.log("Web client Connected", "SERVER");

            for (const action of this._actions) {
                socket.on(
                    action.name,
                    (
                        data,
                        callback: (res: Validate.ValidationResult) => void
                    ) => {
                        // Enforce action limit
                        const now = Date.now();
                        if (
                            this._timeSinceLastMsg.has(socket) &&
                            now - this._timeSinceLastMsg.get(socket) <
                                this._timeBetweenActions
                        ) {
                            callback({
                                success: false,
                                errorCode:
                                    Validate.ValidationError.TooManyActions,
                                message:
                                    "You can only act once every " +
                                    this._timeBetweenActions +
                                    " milliseconds!",
                            });
                            return;
                        }
                        this._timeSinceLastMsg.set(socket, now);

                        // Process action
                        logger.log("Action recieved: " + action.name, "SERVER");
                        const agent = socketAgentMap.getAgentFromSocket(socket);
                        let res: Validate.ValidationResult;
                        if (
                            (res = Validate.keyFormat(action.formats, data))
                                .success // TODO &&
                            // (res = Validate.factionType_requirement(
                            //   action.requiredFactionType,
                            //   agent
                            // )).success
                        ) {
                            res = action.validate(agent, socket, data);
                            if (res.success) {
                                action.enact(agent, data);
                            } else {
                                logger.log(
                                    "Action failed to validate: " + res.message,
                                    "SERVER",
                                    LOG.WARN
                                );
                            }
                        }
                        callback(res);
                    }
                );
            }

            socket.on("disconnect", (data) => {
                logger.log("Client disconnected", "SERVER");
                const agent = socketAgentMap.getAgentFromSocket(socket);
                if (agent) {
                    const cc: ConnectionController = new ConnectionController();
                    cc.logout(agent);
                }
                socketAgentMap.removeAgentSocket(socket, agent);
            });
        });
    }

    _loadModels() {
        return Util.AppContext.db.load();
    }

    async _saveModels() {
        return await Util.AppContext.db.save();
    }

    _logoutAll() {
        const agents: Agent[] = Util.AppContext.db.retrieveModels(
            [...socketAgentMap._agentSocket.keys()],
            Agent
        ) as Agent[];
        agents.forEach((agent) => {
            if (agent) {
                const cc: ConnectionController = new ConnectionController();
                cc.logout(agent);
            }
        });
    }

    start() {
        let loaded = false;
        logger.log("Loading game models...", "SERVER");
        this._loadModels().finally(() => {
            logger.log("Load complete", "SERVER");
            loaded = true;
        });

        // Sets up "ctrl + c" to stop server
        process.on("SIGINT", () => {
            logger.log("Shutting down...", "SERVER");
            this._logoutAll();
            this._saveModels().finally(() => {
                logger.log("Server closed", "SERVER");
                process.exit(0);
            });
        });

        // Start http server
        this._listen();
    }
}
