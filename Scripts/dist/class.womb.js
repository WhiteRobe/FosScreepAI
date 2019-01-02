const MK = require('magic.key');
const Bee = require('class.bee');
// const ClassComb = require('class.comb');

const WombInterface = class {
    constructor(){}

    /**
     * Abstract Method
     * @param {ClassComb} comb which produce the creeps/bees
     * @param {Object} object opt.
     */
    oviposit(comb, object){
        console.log(`Abstract Method:oviposit In WombInterface.class`);
    }
};

const ClassCombWomb = class extends WombInterface{
    constructor(){super()}

    /**
     *
     * @param{ClassComb} comb
     * @param{Array} beeList
     */
    oviposit(comb, beeList){

        let plan = populationPlan[comb.room.controller.level]; // Find plan of this room level
        let numOfSpawnInThisComb = comb.spawns.length;
        if(numOfSpawnInThisComb === 0){
            return console.log(`${Game.time}|${comb.combName}: Comb does's have any SPAWN!`);
        }
        let spawnsIndexFrom = 0;

        for(let type in beeList) { // O(T)=6
            let typeData = plan[type];
            if(beeList[type].length < typeData.num){ // Need to reproduce a bee
                for(let s=spawnsIndexFrom; s<numOfSpawnInThisComb; s++){
                    let spawn = comb.spawns[s]; // Find a spawn not busy
                    if(!spawn.spawning){
                        let newBeeName = MK.ROLE[type].shortcut+Game.time;
                        let typeResult = decideType(comb, type);

                        let actionStatus = spawn.spawnCreep(
                            typeResult.part ,
                            newBeeName,
                            {
                                memory : typeResult.memory
                            }
                        );

                        if(actionStatus === OK){
                            console.log(`${Game.time}|${comb.combName}: Create Bee:${newBeeName}, return OK!`);
                            let newBee = new Bee(Game.creeps[newBeeName], comb);
                            comb.addBee(newBee);
                        } else {
                            console.log(`${Game.time}|${comb.combName}: Create Bee:${newBeeName}, return ${spawnCodeToString(actionStatus)}!`);
                        }
                        spawnsIndexFrom += 1; // Note that this one/spawn has been used
                        break;
                    }
                }
            }
        }
    }
};



const ClassQueenWomb = class extends WombInterface{
    constructor(){super()}

    /**
     * @param{ClassComb} comb
     * @param{object} beeInfo {part:[],memory:{}}
     */
    oviposit(comb, beeInfo){

        let numOfSpawnInThisComb = comb.spawns.length;
        if(numOfSpawnInThisComb === 0){
            return console.log(`${Game.time}|${comb.combName}: Queen's home-comb does's have any SPAWN!`);
        }
        let spawnsIndexFrom = 0;

        for(let s=spawnsIndexFrom; s<numOfSpawnInThisComb; s++){
            let spawn = comb.spawns[s]; // Find a spawn not busy
            if(!spawn.spawning){
                let newBeeName = 'Qs'+Game.time; // Queen Belong to
                let actionStatus = spawn.spawnCreep(
                    beeInfo.part ,
                    newBeeName,
                    {
                        memory : beeInfo.memory
                    }
                );

                if(actionStatus === OK){
                    console.log(`${Game.time}|${comb.combName}: Create Queen's Bee:${newBeeName}, return OK!`);
                    let newBee = new Bee(Game.creeps[newBeeName], comb);
                    comb.addBee(newBee);
                } else {
                    console.log(`${Game.time}|${comb.combName}: Create Queen's Bee:${newBeeName}, return ${spawnCodeToString(actionStatus)}!`);
                }
                spawnsIndexFrom += 1; // Note that this one/spawn has been used
                return actionStatus;
                //break;
            }
        }
        return undefined;
    }
};


module.exports.ClassCombWomb = ClassCombWomb;
module.exports.ClassQueenWomb = ClassQueenWomb;

// --------- private ---------
function decideType(comb, occupation) {
    let result = {
        part:[],
        memory:{}
    };

    let roomLevel = comb.room.controller.level;
    let roomEnergy = comb.room.energyAvailable;
    let roomEnergyCapacity = comb.room.energyCapacityAvailable;
    let sourceNum = comb.resources.sources.length;

    switch (occupation) {
        case MK.ROLE.Harvester.value:
            if(roomLevel <= 2) result.part = [WORK, CARRY, MOVE];
            else if(roomEnergy/roomEnergyCapacity>0.5 && 300<=roomEnergy && roomEnergy<400){
                result.part = [WORK, WORK, CARRY, MOVE];
            }
            else if(roomEnergy/roomEnergyCapacity>0.5 && 400<=roomEnergy && roomEnergy<600){
                result.part = [WORK, WORK, WORK, CARRY, MOVE];
            }
            else if(roomEnergy/roomEnergyCapacity>0.5 && roomEnergy>=600){
                result.part = [WORK, WORK, WORK, WORK, WORK, MOVE, MOVE];
            }
            else{
                result.part = [WORK, CARRY, MOVE];
            }
            break;
        case MK.ROLE.Transfer.value:
            if(roomLevel<=2) result.part = [CARRY, CARRY, MOVE];
            else{
                if(roomEnergy>=300) result.part = [CARRY, CARRY, CARRY, CARRY, MOVE, MOVE];
                else result.part = [CARRY, CARRY, MOVE];
            }
            break;
        case MK.ROLE.Upgrader.value: // Upgrader have the same parts with builder
        case MK.ROLE.Builder.value:
            if(roomLevel <=2) result.part = [WORK, CARRY, MOVE];
            else if(roomEnergy/roomEnergyCapacity>0.5 && roomEnergy>=400){
                result.part = [WORK, WORK, CARRY, CARRY, MOVE, MOVE];
            } else {
                result.part = [WORK, CARRY, MOVE];
            }
            break;
        case MK.ROLE.Fixer.value:
            if(roomLevel >= 5) result.part = [WORK, CARRY, CARRY, MOVE, MOVE];
            else result.part = [WORK, CARRY, MOVE];
            break;
        case MK.ROLE.Soldier.value:
            if(roomEnergy/roomEnergyCapacity>0.5 && roomEnergy>=400){
                result.part = [TOUGH, TOUGH, TOUGH, TOUGH, ATTACK, ATTACK, MOVE, MOVE, MOVE];
            } else {
                result.part = [TOUGH, ATTACK, MOVE];
            }
            break;
        default:
            console.log(`${Game.time}|decideType:Error unknown-type [${occupation}]`);
    }


    result.memory.occupation = occupation;
    result.memory.myCombName = comb.combName;
    console.log(`创建人口配置: ${JSON.stringify(result)} \n`+
        `roomLevel:${roomLevel}, roomEnergy:${roomEnergy},`+
        `roomEnergyCapacity:${roomEnergyCapacity}, sourceNum:${sourceNum}`);
    return result;
}

function spawnCodeToString(code) {
    switch (code) {
        case OK:
            return 'OK';
        case ERR_NOT_OWNER:
            return 'ERR_NOT_OWNER';
        case ERR_NAME_EXISTS:
            return 'ERR_NAME_EXISTS';
        case ERR_BUSY:
            return 'ERR_BUSY';
        case ERR_NOT_ENOUGH_ENERGY:
            return 'ERR_NOT_ENOUGH_ENERGY';
        case ERR_INVALID_ARGS:
            return 'ERR_INVALID_ARGS';
        case ERR_RCL_NOT_ENOUGH:
            return 'ERR_RCL_NOT_ENOUGH';
        default:
            return 'UNKNOWN';
    }
}

const populationPlan = {
    /**
     * MOVE 50
     * WORK 100
     * CARRY 50
     * ATTACK 80
     * RANGED_ATTACK 150
     * HEAL 250
     * CLAIM 600
     * TOUGH 10*/
    // control-level : {planPopulation}
    // planPopulation.key should be keep the same as magic.key.js/_MagicKeyRole.[keys]
    1:{
        // energyCapacity : 300
        level:1,
        Harvester : {
            num : 1
        },
        Transfer :{
            num : 0
        },
        Upgrader : {
            num : 1
        },
        Fixer : {
            num : 0
        },
        Builder : {
            num : 0
        },
        Soldier :{
            num : 0
        }
    },
    2:{
        // energyCapacity : 300 + 5 * 50
        level:2,
        Harvester : {
            num : 2
        },
        Transfer :{
            num : 0
        },
        Upgrader : {
            num : 1
        },
        Fixer : {
            num : 1
        },
        Builder : {
            num : 1
        },
        Soldier :{
            num : 0
        }
    },
    3:{
        // energyCapacity : 300 + 10 * 50
        level:3,
        Harvester : {
            num : 1
        },
        Transfer :{
            num : 1
        },
        Upgrader : {
            num : 1
        },
        Fixer : {
            num : 1
        },
        Builder : {
            num : 1
        },
        Soldier :{
            num : 0
        }
    },
    4:{
        // energyCapacity : 300 + 20 * 50
        level:4,
        Harvester : {
            num : 1
        },
        Transfer :{
            num : 1
        },
        Upgrader : {
            num : 1
        },
        Fixer : {
            num : 1
        },
        Builder : {
            num : 1
        },
        Soldier :{
            num : 0
        }
    },
    5:{
        // energyCapacity : 300 + 30 * 50
        level:5,
        Harvester : {
            num : 1
        },
        Transfer :{
            num : 2
        },
        Upgrader : {
            num : 2
        },
        Fixer : {
            num : 1
        },
        Builder : {
            num : 1
        },
        Soldier :{
            num : 0
        }
    },
    6:{
        level:6,
        Harvester : {
            num : 1
        },
        Transfer :{
            num : 2
        },
        Upgrader : {
            num : 1
        },
        Fixer : {
            num : 1
        },
        Builder : {
            num : 1
        },
        Soldier :{
            num : 0
        }
    },
    7:{
        level:7,
        Harvester : {
            num : 1
        },
        Transfer :{
            num : 0
        },
        Upgrader : {
            num : 1
        },
        Fixer : {
            num : 0
        },
        Builder : {
            num : 0
        },
        Soldier :{
            num : 0
        }
    },
    8:{
        level:8,
        Harvester : {
            num : 1
        },
        Transfer :{
            num : 0
        },
        Upgrader : {
            num : 1
        },
        Fixer : {
            num : 0
        },
        Builder : {
            num : 0
        },
        Soldier :{
            num : 0
        }
    }
};