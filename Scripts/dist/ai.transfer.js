const _ = require('lodash');

class AITransferInterface {
    constructor(){
        this.jobList = {
            None : undefined,
            Pick : 'Pick',
            Pull : 'Pull',
            Transfer : 'Transfer',
            Withdraw : 'Withdraw'
        };

        this.visualizePathStyle = {
            stroke: '#4169E1'
        };
    }

    /**
     * Abstract
     * @param bee
     */
    pick(bee){
        console.log('Abstract Method:pick() in AITransferInterface.class');
    }

    /**
     * Abstract
     * @param bee
     */
    pull(bee){
        console.log('Abstract Method:pull() in AITransferInterface.class');
    }

    /**
     * Abstract
     * @param bee
     */
    transfer(bee){
        console.log('Abstract Method:transfer() in AITransferInterface.class');
    }

    /**
     * Abstract
     * @param bee
     */
    withdraw(bee){
        console.log('Abstract Method:withdraw() in AITransferInterface.class');
    }

    /**
     * Abstract
     * @param bee
     */
    findJob(bee){
        console.log('Abstract Method:findJob() in AITransferInterface.class');
    }

    run(bee){
        let creep = bee.creep;
        // console.log(Game.time, JSON.stringify(creep.memory.job));
        if(!creep.memory.job){
            // Find an job
            this.findJob(bee);
        } else {
            // Do the job
            switch (creep.memory.job) {
                case this.jobList.Pick:
                    this.pick(bee);
                    break;
                case this.jobList.Pull:
                    this.pull(bee);
                    break;
                case this.jobList.Transfer:
                    this.transfer(bee);
                    break;
                case this.jobList.Withdraw:
                    this.withdraw(bee);
                    break;
                default:
                    creep.say('❌ 未知工作！');
                    break;
            }
        }
    }
}

const InterfaceCivilian = require('interface.civilian');
const DefaultProducer = InterfaceCivilian.DefaultProducer;

/**
* DefaultTransfer.class will always try to transfer energy by this priority:
* from : dropped-energy(if in range of x/around source.class) > container
* to : extension > spawn > <s>(storage)</s>
 *
 * @type {AITransferInterface}
*/
const DefaultTransfer = new AITransferInterface();

DefaultTransfer.findJob = function(bee){
    let creep = bee.creep;
    if(creep.carry.energy === 0){
        let target = undefined;

        // Firstly, find dropped-energy nearby first
        let droppedEnergyList = creep.pos.findInRange(FIND_DROPPED_RESOURCES, 3);
        if(droppedEnergyList.length > 0) { // Order by L1
            droppedEnergyList = _.filter(droppedEnergyList, r => r.resourceType === RESOURCE_ENERGY);
            droppedEnergyList = _.sortBy(droppedEnergyList, e =>
                Math.abs(creep.pos.x-e.pos.x) + Math.abs(creep.pos.y-e.pos.y)
            );
            // for(let e in droppedEnergyList){
            //     if(creep.carryCapacity >= creep.carry.energy + e.amount){
            //         target = e;
            //         break;
            //     }
            // }
            target = droppedEnergyList[0];
        }

        if(target){
            creep.memory.job = this.jobList.Pick;
            creep.memory.target = target.id;
            return;
        }

        // Else, find container that is around the energy-source
        let containers = [];

        _.forEach(bee.myComb.resources.sources, source => {
            let sp = source.pos;
            containers = _.union(containers, creep.room.lookForAtArea(
                LOOK_STRUCTURES,sp.y-1, sp.x-1, sp.y+1, sp.x+1, true)
            );

        });

        containers = _.filter(containers,
            s => s.structure && s.structure.structureType === STRUCTURE_CONTAINER
                    && s.structure.store[RESOURCE_ENERGY] > 0
        );
        containers = _.map(containers, s => s.structure);

        if(containers.length > 0){
            containers = _.sortBy(containers, s => // Order by Manhattan-distance(L1)
                Math.abs(creep.pos.x-s.pos.x) + Math.abs(creep.pos.y-s.pos.y)
            );
            target = containers[0];
        }

        if(target){
            creep.memory.job = this.jobList.Withdraw;
            creep.memory.target = target.id;
            return;
        }
    } else {
        // Store energy
        let target = undefined;

        let tempStoreList = DefaultProducer.findExtensionOrSpawn(bee, false);
        tempStoreList = _.sortBy(tempStoreList, s => // Order by L1
            Math.abs(creep.pos.x - s.pos.x) + Math.abs(creep.pos.y - s.pos.y)
        );
        target = tempStoreList[0];
        if(target){
            creep.memory.job = this.jobList.Transfer;
            creep.memory.target = target.id;
            return;
        }


        target = bee.myComb.room.storage;// Find storage first
        if(target){
            creep.memory.job = this.jobList.Transfer;
            creep.memory.target = target.id;
            return;
        }

        // tempStoreList = DefaultProducer.findContainerOrStorage(bee, false);
        // tempStoreList = _.filter(tempStoreList, s => s.structureType === STRUCTURE_CONTAINER)
        // target = tempStoreList[0];
        // if(target){
        //     creep.memory.job = this.jobList.Transfer;
        //     creep.memory.target = target.id;
        //     return;
        // }
    }
};

DefaultTransfer.pick = function(bee){
    let creep = bee.creep;
    let target = Game.getObjectById(creep.memory.target);
    if(target){
        let actionStatus = creep.pickup(target);
        switch (actionStatus) {
            case ERR_NOT_IN_RANGE:
                creep.moveTo(target,{ visualizePathStyle:this.visualizePathStyle });
                creep.say('🐈 捡东西去!');
                break;
            case OK:
            default:
                // Job cause fatal-error or Job is done
                delete creep.memory.target;
                creep.memory.job = this.jobList.None;
        }
    } else {
        // Job is invalid
        delete creep.memory.target;
        creep.memory.job = this.jobList.None;
    }
};

DefaultTransfer.withdraw = function(bee){
    let creep = bee.creep;
    let target = Game.getObjectById(creep.memory.target);
    if(target && target.store[RESOURCE_ENERGY] > 0){
        let actionStatus = creep.withdraw(target, RESOURCE_ENERGY);

        switch (actionStatus) {
            case ERR_NOT_IN_RANGE:
                let status = creep.moveTo(target,{ visualizePathStyle:this.visualizePathStyle });
                console.log(`move:${status}`);
                creep.say('🛴 提取能源!');
                break;
            case OK:
                if(creep.carry.energy === creep.carryCapacity){
                    // Job is done
                    delete creep.memory.target;
                    creep.memory.job = this.jobList.None;
                }// Else, just wait until carry.energy is filled
                break;
            case ERR_NOT_ENOUGH_RESOURCES:
            default:
                // Job cause fatal-error
                delete creep.memory.target;
                creep.memory.job = this.jobList.None;
        }

        // console.log('TransferLog',Game.time, creep.name,`${creep.pos.x},${creep.pos.y}` ,JSON.stringify(creep.carry), actionStatus, target.structureType);

    } else {
        // Job is invalid
        delete creep.memory.target;
        creep.memory.job = this.jobList.None;
    }
};

DefaultTransfer.transfer = function(bee){
    let creep = bee.creep;
    let target = Game.getObjectById(creep.memory.target);
    if(target && target.store[RESOURCE_ENERGY] < target.storeCapacity){
        let actionStatus = creep.transfer(target, RESOURCE_ENERGY);
        console.log(actionStatus, target.structureType);
        switch (actionStatus) {
            case ERR_NOT_IN_RANGE:
                creep.moveTo(target,{ visualizePathStyle:this.visualizePathStyle });
                creep.say('🚒 运送能源!');
                break;
            case OK:
            case ERR_FULL:
            default:
                // Job cause fatal-error or job is done
                delete creep.memory.target;
                creep.memory.job = this.jobList.None;
        }
    } else {
        // Job is invalid
        delete creep.memory.target;
        creep.memory.job = this.jobList.None;
    }
};


module.exports.DefaultTransfer = DefaultTransfer;