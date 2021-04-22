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
        console.log("Added Player");
        this.s_to_p.set(player.socket.id, player);
    }
    start() {
        this.index = 0;
        for (let player of this.players) {
            player.send("start");
        }
        var roomID = this.RoomID;
        this.heartbeat = setInterval(function () { server_1.rooms.get(roomID).send_data(); }, 1);
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
        //console.log(Math.random())
        let data = [];
        if (this.players.length == 0) {
            this.empty = true;
            this.break_room();
        }
        for (let player of this.players) {
            data.push(player.data);
            if (player.socket.disconnected) {
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
        }
        else {
            console.log("NO PLAYER");
        }
    }
}
exports.Game = Game;
//# sourceMappingURL=room.js.map