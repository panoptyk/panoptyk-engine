import app from "./app";
import { Server } from "./server";

const PanoptykServer = new Server(app);

PanoptykServer.start();