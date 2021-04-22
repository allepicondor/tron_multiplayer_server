"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.rooms = void 0;
const room_1 = require("./room");
const http_1 = require("http");
const socket_io_1 = require("socket.io");
const httpServer = http_1.createServer();
const io = new socket_io_1.Server(httpServer, {
    cors: {
        origin: '*',
    },
});
console.log("Starting");
exports.rooms = new Map();
io.on("connection", (socket) => {
    socket.on("join", (arg) => {
        let roomCode = parseInt(arg);
        console.log(socket.id + " trying to join room " + roomCode);
        if (exports.rooms.has(roomCode)) {
            socket.join(roomCode.toString());
            let room = exports.rooms.get(roomCode);
            room.add_player(new room_1.Player(socket));
        }
        else {
            console.log("Room does not exist");
        }
    });
    socket.on("create", (arg) => {
        let settings = arg;
        let roomCode = Math.floor(Math.random() * (100000 - 1000) + 100000);
        console.log(roomCode);
        let room = new room_1.Game(roomCode, settings);
        console.log(socket.id + " created room " + roomCode);
        room.add_player(new room_1.Player(socket));
        exports.rooms.set(roomCode, room);
        socket.join(roomCode.toString());
    });
});
io.of("/").adapter.on("create-room", (room) => {
    //console.log(`room ${room} was created`);
});
io.of("/").adapter.on("join-room", (room, id) => {
    //console.log(`socket ${id} has joined room ${room}`);
});
console.log("Starting Server");
httpServer.listen(5000);
//# sourceMappingURL=server.js.map