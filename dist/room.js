"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Game = exports.Player = void 0;
const server_1 = require("./server");
class Player {
    constructor(socket) {
        this.socket = socket;
        this.data;
    }
    send(event, args) {
        this.socket.emit(event, args);
    }
}
exports.Player = Player;
class Game {
    constructor(RoomID, settings) {
        this.players = [];
        this.s_to_p = new Map();
        this.empty = true;
        this.index = 0;
        this.score = [0, 0, 0, 0];
        this.indexs = [0, 0, 0, 0];
        this.RoomID = RoomID;
        this.settings = settings;
    }
    add_player(player) {
        this.empty = false;
        this.players.push(player);
        var roomID = this.RoomID;
        player.socket.on("gameData", function (e) { server_1.rooms.get(roomID).player_data(e); });
        player.socket.on("stop", function (e) {
            server_1.rooms.get(roomID).stop(e);
        });
        player.socket.on("start", function (e) {
            server_1.rooms.get(roomID).start();
        });
        player.socket.on("disconnection", function (e) {
            server_1.rooms.get(roomID).handle_disconection();
        });
        player.send("joinedRoom", { "roomID": this.RoomID, "settings": this.settings, "Nplayer": this.players.length - 1 });
        console.log("Added Player " + (this.players.length - 1).toString());
        this.s_to_p.set(player.socket.id, player);
    }
    start() {
        this.indexs = [0, 0, 0, 0];
        this.index = 0;
        for (let player of this.players) {
            player.send("start");
        }
        var roomID = this.RoomID;
        this.heartbeat = setInterval(function () {
            try {
                server_1.rooms.get(roomID).send_data();
            }
            catch (e) {
                console.log("No Room");
            }
        }, 1);
    }
    stop(lastAlive) {
        clearInterval(this.heartbeat);
        this.score[lastAlive] += 1;
    }
    handle_disconection() {
    }
    break_room() {
        console.log("removing room " + this.RoomID.toString());
        clearInterval(this.heartbeat);
        server_1.rooms.delete(this.RoomID);
        console.log("Done");
        return;
    }
    send_data() {
        //console.log(this.indexs)
        let data = [];
        if (this.players.length == 0) {
            console.log("No players, removing room");
            this.empty = true;
            this.break_room();
        }
        for (let player of this.players) {
            data.push(player.data);
            if (player.socket.disconnected) {
                console.log("removing player" + this.players.indexOf(player));
                this.players.splice(this.players.indexOf(player), 1);
            }
        }
        //console.log("here")
        for (let player of this.players) {
            player.socket.emit("data", { "data": data, "index": this.index });
        }
        this.index++;
    }
    player_data(arg) {
        let player = this.players[arg.playerID];
        if (player != undefined) {
            player.data = arg.data;
            this.indexs[arg.playerID] = arg.data.index;
        }
        else {
            throw "NO PLAYER" + arg.playerID;
        }
    }
}
exports.Game = Game;
//# sourceMappingURL=room.js.map