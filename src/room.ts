import {Socket} from "socket.io";
import {rooms} from "./server"
export interface Settings {
    playerN: number;
    speed: number;
    size: [number,number]
}
interface PlayerData {
    heading: [number,number]
    location: [number,number]
    index: number
}
export class Player{
    socket:Socket
    data:PlayerData
    constructor(socket:Socket) {
        this.socket = socket
        this.data
    }
    send(event:string,args?:any){
        this.socket.emit(event,args)
    }
}
export class Game {
    players:Player[] = []
    RoomID:number
    settings:Settings;
    s_to_p: Map<string,Player> = new Map<string, Player>()
    heartbeat: NodeJS.Timer
    empty: boolean = true
    index:number  = 0;
    score:[number,number,number,number] = [0,0,0,0]
    indexs = [0,0,0,0]
    constructor(RoomID:number,settings:Settings) {
        this.RoomID = RoomID
        this.settings = settings
    }

    add_player(player:Player){
        this.empty = false
        this.players.push(player)
        var roomID = this.RoomID
        player.socket.on("gameData",function(e) { rooms.get(roomID).player_data(e)})
        player.socket.on("stop",function(e) {
            rooms.get(roomID).stop(e)
        })
        player.socket.on("start",function(e) {
            rooms.get(roomID).start()
        })
        player.socket.on("disconnection",function(e) {
            rooms.get(roomID).handle_disconection()
        })
        player.send("joinedRoom", {"roomID":this.RoomID,"settings":this.settings,"Nplayer":this.players.length-1})
        console.log("Added Player "+(this.players.length-1).toString())
        this.s_to_p.set(player.socket.id,player)
    }
    start(){
        this.indexs = [0,0,0,0]
        this.index = 0
        for (let player of this.players){
            player.send("start")
        }
        var roomID = this.RoomID
        this.heartbeat = setInterval(function() {
            try {
                rooms.get(roomID).send_data();
            }catch (e){
                console.log("No Room")
            }

            },1)
    }
    stop(lastAlive:number){
        clearInterval(this.heartbeat);
        this.score[lastAlive] += 1
    }
    handle_disconection(){

    }
    break_room(){
        console.log("removing room "+ this.RoomID.toString())
        clearInterval(this.heartbeat);
        rooms.delete(this.RoomID)
        console.log("Done")
        return
    }
    send_data(){
        //console.log(this.indexs)
        let data = []
        if (this.players.length == 0){
            console.log("No players, removing room")
            this.empty = true
            this.break_room()
        }
        for (let player of this.players) {
            data.push(player.data)
            if (player.socket.disconnected){
                console.log("removing player"+this.players.indexOf(player),)
                this.players.splice(this.players.indexOf(player),1)

            }
        }
        //console.log("here")
        for (let player of this.players) {
            player.socket.emit("data",{"data":data,"index":this.index})
        }
        this.index++;

    }

    player_data(arg){

        let player = this.players[arg.playerID]
        if (player != undefined) {
            player.data = arg.data
            this.indexs[arg.playerID] = arg.data.index
        }else{
            throw "NO PLAYER" +arg.playerID
        }
    }
}