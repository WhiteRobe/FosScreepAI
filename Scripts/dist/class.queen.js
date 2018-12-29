const Comb = require('class.comb');
const Womb = require('class.queen.womb');
const Mind = require('class.queen.mind');

const _ = require('lodash');

/**
* ClassQueen is the top-level manager of your bees/creeps
* You can have only one instance of ClassQueen
*
* @method constructor(masterName, homeShard, homeRoom)
* @for ClassQueen
* @param{string} masterName : Player's ID, who owns this queen
* @param{object} homeShard : The shard where your queen lives
* @param{string} homeRoom : The room where your queen lives
*/
const ClassQueen = class {

    constructor(masterName, homeShard, homeRoom){
        this._masterName = masterName;
        this._homeShard = homeShard;
        this._homeRoom = homeRoom;

        this.combs = []; // Combs under queen's/your control
        this.queenIsAvaliable = false; // If the queen is ready to control your bees(creeps)

        this.buildBody();
    }

    get masterName() {
        return this._masterName;
    }

    set masterName(value) {
        this._masterName = value;
    }

    get homeShard() {
        return this._homeShard;
    }

    set homeShard(value) {
        this._homeShard = value;
    }

    get homeRoom() {
        return this._homeRoom;
    }

    set homeRoom(value) {
        this._homeRoom = value;
    }

    /**
    * Queen's body is composed several parts
    * This function will be called when ClassQueen is built
    */
    buildBody(){
        this.womb = new Womb(); // An organ to produce new bees
        this.mind = new Mind(); // An organ to control your queen
    }

    /**
    * 'Neural Junction' means: Queen will find all of her bees in each room
    * But at first, queen need to find all of her combs/room
    * */
    junction(callback){
        this.combs = [];
        for(let r in Game.rooms){
            // Game.rooms contains a map of rooms which your creep is present
            let room = Game.rooms[r];
            if(room.controller && room.controller.owner
                && room.controller.owner.username === this.masterName){
                // If the controller is present and belong to you
                // or, of we say, you have owned this room
                let newComb = new Comb(room, this); // Wrapper this room.class to comb.class
                newComb.junction(); // Active this comb
                this.combs.push(newComb); // Make it under your queen's control
            }
        }

        this.queenIsAvaliable = true;
        if(callback){
            callback();
        } else {
            console.log(`${Game.time}|${this.homeRoom}:Queen is awake!`);
        }
    }


    doCommand(plan){
        // Control your empire
        _.forEach(this.combs, comb => comb.run());
    }

    checkAllBees(){
        _.forEach(this.combs, comb => comb.checkBees());
    }

    oviposit(){
        // this.womb.oviposit(); // Delegate
    }

    notify(event, callback){
        // Your bees notify your queen to do something
    }

    dispatch(bee, event, callback){
        // Your queen dispatch event to a bee
    }
};

module.exports = ClassQueen;
