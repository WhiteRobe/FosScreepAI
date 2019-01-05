const _ = require('lodash');
const MK = require('magic.key');

const AIInterface = require('interface.ai');
const AIHarvester = require('ai.harvester');
const AITransfer = require('ai.transfer');
const AIUpgrader = require('ai.upgrader');
const AIFixer = require('ai.fixer');
const AIBuilder = require('ai.builder');
const AISoldier = require('ai.soldier');

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
        this._creep = creep; // Creep.class which this ClassBee warped
        this._myComb = myComb;

        this._AI = undefined; // AI who drive this bee to move

        this.creepName = creep.name; // A static memory, remember this creep in case it dies
        this.myQueen = myComb.myQueen;
    };

    get creep() {
        // Never refresh creep at this segment, it's a waste of CPU
        // Instead, refresh it in Method:run() -> get isAlive()
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
        if(value) {
            console.log(`${Game.time}|${this.myComb.combName}: Decide AI [${value.AIName}] for [${this.creepName}].`);
            this.creep.memory.AI = value.AIName;
        }
        this._AI = value;
    }

    /**
    * Wrapper Attribute: Is this bee still alive?
    */
    get isAlive(){
        this.creep = Game.creeps[this.creepName]; // Refresh-Creep-Data
        //console.log('isAlive',this.creep);
        return this.creep!==undefined;
    }

    statistics(){
        // Statistics this comb's status

    }

    run(){

        if(!this.isAlive) {
            // this.myComb.notify({"event":"bee dead"});
            return console.log(`${Game.time}|${this.myComb.combName}: `+
                `Bee ${this.creepName} is dead . Waiting for being cleaned...`);
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
        let AI = new AIInterface();

        _.forEach(body, b => parts[b.type] = parts[b.type]+1);

        switch (occupation) {
            case MK.ROLE.Harvester.value:
                if(parts.carry === 0) AI = AIHarvester.AlwaysHarvester;
                else if(parts.work <= 2) AI = AIHarvester.DefaultHarvester;
                else AI = AIHarvester.IntentHarvester;
                break;
            case MK.ROLE.Transfer.value:
                if(!this.creep.memory.profession) AI = AITransfer.DefaultTransfer;
                else if(this.creep.memory.profession === 'RemoteTransfer') AI = AITransfer.RemoteTransfer;
                break;
            case MK.ROLE.Upgrader.value:
                AI = AIUpgrader.DefaultUpgrader;
                break;
            case MK.ROLE.Builder.value:
                if(!this.creep.memory.profession) AI = AIBuilder.DefaultBuilder;
                else if(this.creep.memory.profession === 'RemoteBuild') AI = AIBuilder.RemoteBuilder;
                break;
            case MK.ROLE.Fixer.value:
                if(parts.carry===1) AI = AIFixer.DefaultFixer;
                else AI = AIFixer.LorryFixer;
                break;
            case MK.ROLE.Soldier.value:
                if(!this.creep.memory.profession) AI = AISoldier.DefaultSoldier;
                else if(this.creep.memory.profession === 'RemoteAttack') AI = AISoldier.RemoteSwordSoldier; // MagicKey link to class.queen.mind remain to fix
                else if(this.creep.memory.profession === 'Reserve') AI = AISoldier.ReserveSoldier;
                else if(this.creep.memory.profession === 'Claim') AI = AISoldier.ClaimSoldier;
                else if(this.creep.memory.profession === 'Sign') AI = AISoldier.SignerSoldier;
                else AI = AISoldier.DefaultSoldier;
                break;
            default:
                console.log(`${Game.time}${this.myComb.combName} : Decide AI Error => unknown-type [${occupation}]`);
        }

        return AI;
    }

};

module.exports = ClassBee;