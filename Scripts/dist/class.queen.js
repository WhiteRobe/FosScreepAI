const Bee = require('class.bee');
const Comb = require('class.comb');
const Womb = require('class.womb');
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

        this.homeComb = undefined;
        this.combs = []; // Combs under queen's/your control
        this.bees = [];
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
        this.womb = new Womb.ClassQueenWomb(); // An organ to produce new bees
        this.mind = new Mind(this); // An organ to control your queen
    }

    /**
    * 'Neural Junction' means: Queen will find all of her bees in each room
    * But at first, queen need to find all of her combs/room
    * */
    junction(callback){

        this.findMyCombs();

        this.findMyBees();

        this.queenIsAvaliable = true;

        if(callback){
            callback();
        } else {
            console.log(`${Game.time}|${this.homeRoom}: Queen is awake!`);
        }
    }

    /**
     *Find combs belong to this queen
     */
    findMyCombs(){
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
                if(newComb.combName === this.homeRoom){
                    this.homeComb = newComb;
                }
            }
        }

        if(this.homeComb===undefined){
            console.log(`${Game.time}|${this.combName}: Queen has lost her room. Find another room for her!`);
        }
    }

    /**
     *Find bees belong to this queen
     */
    findMyBees(){
        this.bees = [];
        for(let c in Game.creeps){
            let creep = Game.creeps[c];

            if(creep.memory.queenDirectly){
                this.bees.push(new Bee(creep, this.homeComb));
                console.log(`${Game.time}|${this.homeComb.combName}: Find Queen's Bee [${creep.name}], memory is \n`+
                    `${JSON.stringify(creep.memory)}!`);
            }
        }
    }


    doCommand(plan){
        // 1. Queen will think what next to do
        this.mind.think();
        // 2. Control your empire
        _.forEach(this.combs, comb => comb.run());
        // 3. Control the bees belong to queen
        _.forEach(this.bees, bee => bee.run());
    }


    checkAllBees(){
        _.forEach(this.combs, comb => comb.checkBees());

        // Check Directly-Bee's Status
        _.forEach(this.bees, bee => {
            if (!bee.isAlive) {
                console.log(`${Game.time}|${bee.myComb.combName}:Clean dead-body ${bee.creepName}`);
                delete Memory.creeps[bee.creepName]; // clean dead bees
            }
        });
    }

    oviposit(beeInfo){
        // this.womb.oviposit(); // Delegate
        return this.womb.oviposit(this.homeComb, beeInfo);
    }

    notify(event, callback){
        // Your bees notify your queen to do something
    }

    dispatch(bee, event, callback){
        // Your queen dispatch event to a bee
    }
};

module.exports = ClassQueen;
