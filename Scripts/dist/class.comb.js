const _ = require('lodash');
const Bee = require('class.bee');
const BeeStructure = require('class.beestructure');
const Womb = require('class.womb');
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
 * @type {ClassComb}
*/
const ClassComb = class {
    constructor(room, myQueen){
        this._room = room;
        this._myQueen = myQueen;

        // Remember to fresh these when use
        this.resources = {}; // A resources map contains key:sources(list[Resource]) and key:mineral(Mineral)
        this.spawns = []; // A array store your STRUCTURE_SPAWNS in this comb

        this.bees = []; // A array store your bees/creeps belong to this comb
        this.structures = []; // A array store your structures belong to this comb(store by object.id)

        this.combIsAvaliable = false;
        this.womb = new Womb.ClassCombWomb();

        this.memory={};
        // this.junction();
    };

    get room() {
        // When try to get a GameObject Room, refresh it first
        try{
            this._room = Game.rooms[this._room.name];
        }catch (e) {
            console.log(`${Game.time}|${this.combName}: Room maybe ruined, please check!`)
        }
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
    junction(callback){
        this.findResources();
        this.findMySpawns();
        this.findMyBees();
        this.findMyStructures();
        this.combIsAvaliable = true;
        if(callback){
            callback();
        } else {
            console.log(`${Game.time}|${this.combName}: Comb is linked!`);
        }
    }

    /**
    * Find sources and mineral in this room
    */
    findResources(){
        let resourcesList = this._room.find(FIND_SOURCES);
        this.resources.sources = [];
        for(let r in resourcesList){
            this.resources.sources.push(resourcesList[r]);
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
                this.bees.push(new Bee(creep, this));
                //console.log(`${Game.time}|${this.combName}: Find Bee [${creep.name}], memory is \n`+
                //    `${JSON.stringify(creep.memory)}!`);
            }
        }
    }

    /**
     *Find specific-structures belong to this comb
     */
    findMyStructures(){
        this.structures = [];
        let targetStructures = this.room.find(FIND_STRUCTURES, {
            filter: s => s.structureType === STRUCTURE_TOWER
        });
        _.forEach(targetStructures, s => {
            this.structures.push(new BeeStructure(s, this));
            //console.log(`${Game.time}|${this.combName}: Find Structure [${s.structureType}:${s.id}]!`);
        })
    }

    /**
     *
     * @param{ClassBee} newBee
     */
    addBee(newBee){
        newBee.myComb = this;
        console.log(`${Game.time}|${this.combName}: AddBee ${newBee.creepName}`);
        this.bees.push(newBee);
    }

    /**
     *
     * @param{ClassBee} removedBee
     */
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

        // These Array's name should be
        // keep the same as magic.ke.js/_MagicKeyRole.{keys}
        // for reflecting
        let Harvester  = [];
        let Transfer  = [];
        let Upgrader  = [];
        let Fixer  = [];
        let Builder  = [];
        let Soldier  = [];

        _.forEach(this.bees, bee =>{
            if(!bee.isAlive){
                console.log(`${Game.time}|${bee.myComb.combName}: [Comb]Clean dead-body ${bee.creepName}`);
                delete Memory.creeps[bee.creepName]; // clean dead bees
            } else {
                beesAlive.push(bee);
                switch (bee.creep.memory.occupation) {
                    case MK.ROLE.Harvester.value:
                        Harvester.push(bee);
                        break;
                    case MK.ROLE.Transfer.value:
                        Transfer.push(bee);
                        break;
                    case MK.ROLE.Upgrader.value:
                        Upgrader.push(bee);
                        break;
                    case MK.ROLE.Fixer.value:
                        Fixer.push(bee);
                        break;
                    case MK.ROLE.Builder.value:
                        Builder.push(bee);
                        break;
                    case MK.ROLE.Soldier.value:
                        Soldier.push(bee);
                        break;
                }
            }
        });

        this.bees = beesAlive; // Save all alive bees

        let beeList = { // Population-Summary
            Harvester, Transfer, Upgrader,
            Fixer, Builder, Soldier
        };

        this.oviposit(beeList);

        return beeList;
    }

    /**
     * Run this comb, every Bee in this room will run
     */
    run(){
        // this.room = Game.getObjectById(this.room.id); // Refresh Data
        _.forEach(this.structures, structure => structure.run());
        _.forEach(this.bees, bee => bee.run());
    }


    notify(event) {
        console.log(`${Game.time}|${this.combName}:Event-Attach =>\n ${JSON.stringify(event)}`);
        if (event) this.junction(); // 临时写法
    }

    /**
     *
     * @param beeList : a Population-Summary object
     */
    oviposit(beeList){
        // refresh room's status -- Hot-fix
        this.spawns = _.map(this.spawns, s => Game.spawns[s.name]);

        this.womb.oviposit(this, beeList);
    }

};


module.exports = ClassComb;