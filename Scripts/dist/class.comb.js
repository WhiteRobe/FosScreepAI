const _ = require('lodash');
const Bee = require('class.bee');
const MK = require('magic.key');

/**
* A Wrapper-class of Room.class
* ClassComb is the second-level manager of your bees/creeps
* You can have several instance of ClassComb
*
* @method constructor(room, myQueen)
* @for ClassComb
* @param{room} room : The Room.class which this Comb wrapper
* @param{ClassQueen} :  myQueen : Queen of this Comb
*/
const ClassComb = class {
    constructor(room, myQueen){
        this._room = room;
        this._myQueen = myQueen;

        this.resources = {}; // A resources map contains key:sources(list[Resource]) and key:mineral(Mineral)
        this.spawns = []; // A array store your STRUCTURE_SPAWNS in this comb
        this.bees = []; // A array store your bees/creeps belong to this comb

        this.combIsAvaliable = false;

        // this.junction();
    };

    get room() {
        return this._room;
    }

    set room(value) {
        this._room = value;
    }

    get myQueen() {
        return this._myQueen;
    }

    set myQueen(value) {
        this._myQueen = value;
    }

    // Wrapper Attribute : name of this comb
    get combName(){
        return this._room.name;
    }

    /**
    * Comb junction will active your Comb and find resources, bees, etc.
    * belong to this comb
    */
    junction(){
        this.findResources();
        this.findMySpawns();
        this.findMyBees();
        this.combIsAvaliable = true;
        console.log(`${Game.time}|${this.combName}:Comb is linked!`);
    }

    /**
    * Find sources and mineral in this room
    */
    findResources(){
        let resourcesList = this._room.find(FIND_SOURCES);
        this.resources.sourses = [];
        for(let r in resourcesList){
            this.resources.sourses.push(resourcesList[r]);
        }

        let mineralsList = this._room.find(FIND_MINERALS);
        this.resources.mineral = mineralsList[0];
    }

    /**
    * Find spawns in this room
    */
    findMySpawns(){
        let spawnsList = this._room.find(FIND_STRUCTURES,
            {
                filter : s => {
                    return s.structureType === STRUCTURE_SPAWN && s.owner.username === this.myQueen.masterName
                }
            });
        this.spawns = [];

        for(let s in spawnsList){
            this.spawns.push(spawnsList[s]);
        }
    }

    /**
    *Find bees belong to this comb
    */
    findMyBees(){
        this.bees = [];
        for(let c in Game.creeps){
            let creep = Game.creeps[c];
            if(creep.memory.myCombName === this.combName){
                this.bees.push(new Bee(creep, this, this.myQueen));
            }
        }
    }

    addBee(newBee){
        newBee.myComb = this;
        this.bees = _.union(this.bees, [newBee]);
    }

    removeBee(removedBee){
        removedBee.myComb = undefined;
        this.bees = _.without(this.bees, removedBee);
    }

    /**
    * Show and return a object of this comb's status
    * @method statistics
    * @return{object} Statics of this comb
    * e.g
    * {
    *   level : 1,
    *   energy : 100,
    *   energyCapacity : 200,
    *   ...
    * }
    */
    statistics(){
        // Statistics this comb's status
        let statics = {};
        statics.level = this._room.controller.level;
        statics.energy = this._room.energyAvailable;
        statics.energyCapacity = this._room.energyCapacity;

        statics.beeCount = {};
        this.bees = _.filter(this.bees, b => b.isAlive);
        _.forEach(this.bees,
            bee => {

            }
        );

        return statics;
    }

    /**
     * This method will clean dead bees,
     * and summary the statics of rest bees in this comb
     *
     */
    checkBees(){
        let beesAlive = [];

        let DefaultHarvester  = [];
        let IntentHarvester  = [];
        let DefaultTransfer  = [];
        let DefaultUpgrader  = [];
        let DefaultFixer  = [];
        let DefaultBuilder  = [];
        let DefaultSoldier  = [];

        _.forEach(this.bees, bee =>{
            if(bee.isAlive){
                beesAlive.push(bee);
                delete Memory.creeps[bee.creepName];
            } else {
                beesAlive.push(bee);
                switch (bee.creep.memory.occupation) {
                    case MK.PRO.Default + MK.ROLE.Harvester:
                        DefaultHarvester.push(bee);
                        break;
                    case MK.PRO.Intent + MK.ROLE.Harvester:
                        IntentHarvester.push(bee);
                        break;
                    case MK.PRO.Default + MK.ROLE.Transfer:
                        DefaultTransfer.push(bee);
                        break;
                    case MK.PRO.Default + MK.ROLE.Upgrader:
                        DefaultUpgrader.push(bee);
                        break;
                    case MK.PRO.Default + MK.ROLE.Fixer:
                        DefaultFixer.push(bee);
                        break;
                    case MK.PRO.Default + MK.ROLE.Builder:
                        DefaultBuilder.push(bee);
                        break;
                    case MK.PRO.Default + MK.ROLE.Soldier:
                        DefaultSoldier.push(bee);
                        break;
                }
            }
        });

        this.bees = beesAlive;
        let beeList = {
            DefaultHarvester,IntentHarvester,DefaultTransfer,
            DefaultUpgrader,DefaultBuilder,DefaultSoldier
        };

        this.oviposit(beeList);

        return beeList;
    }

    /**
     * Run this comb, every Bee in this room will run
     */
    run(){
        _.forEach(this.bees, bee => bee.run());
    }


    notify(){

    }

    oviposit(beeList){
        let womb = this.myQueen.womb;

        womb.oviposit(this, beeList);
    }

};

module.exports = ClassComb;