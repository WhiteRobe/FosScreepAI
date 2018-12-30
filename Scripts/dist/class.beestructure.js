const AIInterface = require('interface.ai');
const AIStructure = require('ai.structure');

class BeeStructure{
    constructor(structure, myComb){
        this._structure = structure;
        this._myComb = myComb;

        this._AI = undefined;

        this.memory = {}; // Notice! AIStructure does's has persistence memory!
        this.structureID = structure.id;
    }

    get structure() {
        return this._structure;
    }

    set structure(value) {
        this._structure = value;
    }

    get myComb() {
        return this._myComb;
    }

    set myComb(value) {
        this._myComb = value;
    }

    get AI(){
        return this._AI;
    }

    set AI(value){
        if(value) console.log(`${Game.time}|${this.myComb.combName}: Decide AI [${value.AIName}] for [${this.structureID}].`);
        this._AI = value;
    }

    get isAlive(){
        this.structure = Game.getObjectById(this.structureID); // Refresh-Structure-Data
        return Game.getObjectById(this.structureID)!==null;
    }

    run(){
        if(!this.isAlive){
            return this.myComb.notify({"event":"building ruined"});
        }

        if(!this.AI){ // Find proper AI
            this.AI = this.decideAI();
        }

        this.AI.run(this);
    }

    decideAI(){
        let type = this.structure.structureType;

        let AI = new AIInterface();

        switch (type) {
            case STRUCTURE_TOWER:
                AI = AIStructure.DefaultTowerAI;
                break;
            default:
                console.log(`${Game.time}|${this.myComb.combName}: Decide AI Error => unknown-type [${type}]`);
        }
        return AI;
    }
}

module.exports = BeeStructure;