const MK = require('magic.key');
const populationPlan = {
    // control-level : {planPopulation}
    1:{
        level:1,
        DefaultHarvester : 1
    },
    2:{
        level:2,
        DefaultHarvester : 1
    },
    3:{
        level:3,
        DefaultHarvester : 1
    },
    4:{
        level:4,
        DefaultHarvester : 1
    },
    5:{
        level:5,
        IntentHarvester : {
            num : 1,
            part : [WORK, WORK, WORK, CARRY, MOVE]
        },
        DefaultTransfer :{
            num : 1,
            part : [CARRY, CARRY, CARRY, CARRY, WORK]
        }
    },
    6:{
        level:6,

    },
    7:{
        level:7,

    },
    8:{
        level:8,

    }
};

const ClassQueenWomb = class {
    constructor(){}

    /**
     *
     * @param{ClassComb} comb
     * @param{Array} beeList
     */
    oviposit(comb, beeList){
        let plan = populationPlan[comb.room.controller.level];
        console.log(plan.level);
        for(let i in beeList) {
            let data = plan[i];
            if(data && beeList[i].length < data.num){

                for(let s in comb.spawns){
                    let spawn = comb.spawns[s];
                    if(!spawn.spawning){
                        spawn.spawnCreep(
                            data.part,
                            i+Game.time,
                            {
                                memory:{
                                    myCombName : comb.combName,
                                    occupation : i
                                }
                            }
                        );
                        break;
                    }
                }
            }
        }
    }
};

module.exports = ClassQueenWomb;
