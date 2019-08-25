import * as io from "socket.io-client";

const socket = io.connect();

export class ClientAPI {
    public static login(name: string, password: string) {
        // tslint:disable-next-line: object-literal-shorthand
        socket.emit("login", {username: name, password: password});
    }
}
