const _ = require('lodash');
const MK = require('magic.key');

const AIHarvester = require('ai.harvester');
const AITransfer = require('ai.transfer');

/**
* A Wrapper-class of Creep.class
* ClassBee is the base unit in the game
* You can have several instance of ClassBee
*
* @method constructor(creep, myComb, myQueen)
* @for ClassBee
* @param{Creep} creep : The Creep.class which this Bee wrapper
* @param{ClassComb} myComb : The Comb.class which this bee is belong to
*/
const ClassBee = class {
    constructor(creep, myComb){
        this._creep = creep;
        this._myComb = myComb;

        this._AI = undefined;

        this.creepName = creep.name;
        this.myQueen = myComb.myQueen;
    };

    get creep() {
        return this._creep;
    }

    set creep(value) {
        this._creep = value;
    }

    get myComb() {
        return this._myComb;
    }

    set myComb(value) {
        this._myComb = value;
    }

    /**
    * Wrapper Attribute: AI control this bee's behavior
    */
    get AI() {
        return this._AI;
    }

    set AI(value) {
        this._AI = value;
    }

    /**
    * Wrapper Attribute: Is this bee still alive?
    */
    get isAlive(){
        return this._creep!==undefined;
    }

    statistics(){
        // Statistics this comb's status

    }

    run(){
        this.creep = Game.getObjectById(this.creep.id); // Refresh Data

        if(!this.isAlive){
            return; // Dead Already, waiting for be cleaned
        }
        else if(this.creep.spawning) {
            return; // Bee is spawning
        }

        if(!this.AI){ // Find proper AI
            this.AI = this.decideAI();
        }

        // Bee's AI will start to control this bee to work
        this.AI.run(this);
    }

    decideAI() {
        let occupation = this.creep.memory.occupation;
        let body = this.creep.body;
        let parts = {
            "move" : 0,
            "work" : 0,
            "carry" : 0,
            "attack" : 0,
            "ranged_attack" : 0,
            "heal" : 0,
            "claim" : 0,
            "tough" : 0
        };
        let AI = AIHarvester.DefaultHarvester;

        _.forEach(body, b => parts[b.type] = parts[b.type]+1);

        switch (occupation) {
            case MK.ROLE.Harvester.value:
                if(parts.work<5) AI = AIHarvester.DefaultHarvester;
                else AI = AIHarvester.IntentHarvester;
                break;
            case MK.ROLE.Transfer.value:
                AI = AITransfer.DefaultTransfer;
                break;
            case MK.ROLE.Builder.value:
                break;
            case MK.ROLE.Upgrader.value:
                break;
            case MK.ROLE.Soldier.value:
                break;
            case MK.ROLE.Fixer.value:
                break;
            default:
                console.log(`${Game.time}|decideAI:Error unknown-type [${occupation}]`);
        }

        return AI;
    }

};

module.exports = ClassBee;