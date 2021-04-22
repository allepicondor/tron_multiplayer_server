import { Game,Player } from './room'

import { createServer } from "http";
import { Server, Socket } from "socket.io";
const httpServer = createServer();
const io = new Server(httpServer, {
    cors: {
        origin:'*',
    },
});
console.log("Starting")


export let rooms = new Map<number, Game>();
io.on("connection", (socket:Socket) => {
    socket.on("join", (arg:string) => {

        let roomCode: number = parseInt(arg)
        console.log(socket.id+" trying to join room "+roomCode )
        if (rooms.has(roomCode)) {
            socket.join(roomCode.toString());
            let room = rooms.get(roomCode)
            room.add_player(new Player(socket))

        }else{
            console.log("Room does not exist")
        }

    });
    socket.on("create", (arg) => {
        let settings = arg;
        let roomCode: number = Math.floor(Math.random() * (100000 - 1000) + 100000);
        console.log(roomCode)
        let room = new Game(roomCode,settings)
        console.log(socket.id+" created room "+roomCode)
        room.add_player(new Player(socket))
        rooms.set(roomCode,room)
        socket.join(roomCode.toString());

    });
});
io.of("/").adapter.on("create-room", (room) => {
    //console.log(`room ${room} was created`);
});

io.of("/").adapter.on("join-room", (room, id) => {
    //console.log(`socket ${id} has joined room ${room}`);
});
console.log("Starting Server")
httpServer.listen(5000);
