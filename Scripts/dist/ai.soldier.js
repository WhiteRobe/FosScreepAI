const _ = require('lodash');
const AIInterface = require('interface.ai');
const InterfaceCivilian = require('interface.civilian');

class AISoldierInterface extends AIInterface{
    constructor(){
        super();
        this.jobList = {
            None : undefined,
            Retreat : 'Retreat',
            Claim : 'Claim',
            Reverse : 'Reverse',
            Patrol : 'Patrol',
            Attack : 'Attack'
        };

        this.visualizePathStyle = {
            stroke: '#FF0000'
        };

        this.AIName = "AISoldierInterface";
    }

}

const DefaultSoldier = new AISoldierInterface();
DefaultSoldier.AIName = "DefaultSoldier";

module.exports.DefaultSoldier = DefaultSoldier;