/**
* A Wrapper-class of Creep.class
* ClassBee is the base unit in the game
* You can have several instance of ClassBee
*
* @method constructor(creep, myComb, myQueen)
* @for ClassBee
* @param{Creep} creep : The Creep.class which this Bee wrapper
* @param{ClassComb} myComb : The Comb.class which this bee is belong to
* @param{ClassQueen} myQueen : Queen of this bee
*/
const ClassBee = class {
    constructor(creep, myComb, myQueen){
        this._creep = creep;
        this._myComb = myComb;
        this._myQueen = myQueen;

        this._AI = undefined;
        this.creepName = creep.name;
    };

    get creep() {
        return this._creep;
    }

    set creep(value) {
        this._creep = value;
    }

    get myComb() {
        return this._comb;
    }

    set myComb(value) {
        this._comb = value;
    }

    get myQueen() {
        return this._myQueen;
    }

    set myQueen(value) {
        this._myQueen = value;
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

    run(callback){
        // Bee's AI will start to control this bee to work
        let status = this.AI.run(this.creep);
        if(callback){
            callback(status);
        } else {
            console.log(`${Game.time}|${this.myComb.combName}:
                Bee[${this.creep.name}]'s work done, return status ${status}`);
        }
    }

};

module.exports = ClassBee;