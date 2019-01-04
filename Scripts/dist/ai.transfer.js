const _ = require('lodash');
const AIInterface = require('interface.ai');
const InterfaceCivilian = require('interface.civilian');
const DefaultConsumer = InterfaceCivilian.DefaultConsumer;

class AITransferInterface extends AIInterface{
    constructor(){
        super();
        this.jobList = {
            None : undefined,
            Pick : 'Pick',
            Pull : 'Pull',
            March :'March',
            Transfer : 'Transfer',
            Withdraw : 'Withdraw'
        };

        this.visualizePathStyle = {
            stroke: '#4169E1',
            opacity: 0.3
        };

        this.AIName = "AITransferInterface";
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

    march(bee){
        console.log('Abstract Method:march() in AITransferInterface.class');
    }

    transfer(bee){
        let creep = bee.creep;
        let target = Game.getObjectById(creep.memory.target);

        if(target &&
            ( target.energy!==undefined && target.energy < target.energyCapacity // hot-fix spawn or extension
                || target.store!==undefined && target.store[RESOURCE_ENERGY] < target.storeCapacity)){

            let targetRemainToFilledNum = target.energy!==undefined?
                target.energyCapacity - target.energy : target.storeCapacity - target.store[RESOURCE_ENERGY];

            let actionStatus = creep.transfer(target, RESOURCE_ENERGY);

            switch (actionStatus) {
                case ERR_NOT_IN_RANGE:
                    creep.moveTo(target,{ visualizePathStyle:this.visualizePathStyle });
                    creep.say('🚒 运送能源!');
                    break;

                case OK:
                case ERR_FULL:
                    if(targetRemainToFilledNum - creep.carry.energy < 0){
                        // Still need to do transfer-job
                        let nextTarget = this.findNextStorage(bee, creep.memory.target);
                        if(nextTarget){ // To save a tick, just do this
                            creep.memory.target = nextTarget.id;
                            creep.say("♻️ 更新目标.");
                            return;//creep.memory.job = this.jobList.Transfer;
                        }
                    } // Else goto default
                default:
                    // Job cause fatal-error or job is done
                    creep.say("✔️ 运输完成.");
                    delete creep.memory.target;
                    creep.memory.job = this.jobList.None;
            }
        } else {
            // Job is invalid
            delete creep.memory.target;
            creep.memory.job = this.jobList.None;
        }
    }


    withdraw(bee){
        let creep = bee.creep;
        let target = Game.getObjectById(creep.memory.target);
        if(target && target.store[RESOURCE_ENERGY] > 0){
            let actionStatus = creep.withdraw(target, RESOURCE_ENERGY);

            switch (actionStatus) {
                case ERR_NOT_IN_RANGE:
                    creep.moveTo(target,{ visualizePathStyle:this.visualizePathStyle });
                    creep.say('🥢 提取能源!');
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
    }

    /**
     * @param bee
     * @param {string} currentTargetId Object.id equals to $currentTargetId will be passed
     * @return {object} // a structure of storage-type object
     */
    findNextStorage(bee, currentTargetId){
        let creep = bee.creep;
        let target = undefined;

        let tempStoreList = DefaultProducer.findExtensionOrSpawn(bee, false);
        tempStoreList = _.sortBy(tempStoreList, s => // Order by L1
            Math.abs(creep.pos.x - s.pos.x) + Math.abs(creep.pos.y - s.pos.y)
        );


        if(currentTargetId){// If has memory, then pick next one for it
            tempStoreList = _.filter(tempStoreList, t => t.id!==currentTargetId);
        }

        target = tempStoreList[0];// Find closest one

        if(!target){
            // If not found, or whatever:
            // Anyway, if there is a storage-structure;
            // noinspection JSValidateTypes
            target = bee.myComb.room.storage;
        }

        return target;
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
        //console.log(Game.time, bee.creepName, JSON.stringify(creep.memory.job));
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
                case this.jobList.March:
                    this.march(bee);
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


const DefaultProducer = InterfaceCivilian.DefaultProducer;

/**
* DefaultTransfer.class will always try to transfer energy by this priority:
* from : dropped-energy(if in range of x/around source.class) > container
* to : extension > spawn > <s>(storage)</s>
 *
 * @type {AITransferInterface}
*/
const DefaultTransfer = new AITransferInterface();
DefaultTransfer.AIName = "DefaultTransfer";

DefaultTransfer.findJob = function(bee){
    let creep = bee.creep;
    creep.say("🕗 找工作中");
    if(creep.carry.energy === 0){
        let target = undefined;

        // Firstly, find dropped-energy nearby first
        let currentSRange = creep.memory.pickSearchingRange;
        if(!currentSRange) { // Dynamic Searching Range
            creep.memory.pickSearchingRange = 5;
            currentSRange = 5;
        }

        let droppedEnergyList = creep.pos.findInRange(FIND_DROPPED_RESOURCES, currentSRange);
        if(droppedEnergyList.length > 0) { // Order by L1
            droppedEnergyList = _.filter(droppedEnergyList, r => r.resourceType === RESOURCE_ENERGY);
            droppedEnergyList = _.sortBy(droppedEnergyList, e =>
                Math.abs(creep.pos.x-e.pos.x) + Math.abs(creep.pos.y-e.pos.y)
            );
            target = droppedEnergyList[0];
        }

        if(target){
            creep.memory.pickSearchingRange = creep.memory.pickSearchingRange - 2; // decrease by floor(5/2)=2
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
            // containers = _.sortBy(containers, s => // Order by Manhattan-distance(L1)
            //     Math.abs(creep.pos.x-s.pos.x) + Math.abs(creep.pos.y-s.pos.y)
            // );
            // hot-fix临时修正为：提取最满的能量罐
            containers = _.sortByOrder(containers, s => s.store[RESOURCE_ENERGY], ['desc']);
            target = containers[0];
        }

        if(target){
            creep.memory.job = this.jobList.Withdraw;
            creep.memory.target = target.id;
            return;
        }

        // Still nothing to do, increase searching range
        creep.say("➕ 搜寻范围 "+ currentSRange);
        creep.memory.pickSearchingRange = Math.min(currentSRange+5, 20);

    } else {
        // Store energy
        let target = this.findNextStorage(bee);
        if(target){
            creep.memory.job = this.jobList.Transfer;
            creep.memory.target = target.id;
            return;
        }


        creep.say("❌ 无储存空间");
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


const RemoteTransfer = new AITransferInterface();
RemoteTransfer.AIName = "RemoteTransfer";

RemoteTransfer.findJob = function(bee){
    let creep = bee.creep;
    creep.say("🕗 找工作中");
    if(creep.carry.energy <= 0){

        if(creep.room.name !== creep.memory.homeRoomName){ // Go back
            creep.memory.job = this.jobList.March;
            creep.memory.marchTarget = creep.memory.homeRoomName;
            return;
        }

        let targetList = DefaultConsumer.findEnergyStorageOrContainer(bee);

        if(targetList.length>0){
            creep.memory.job = this.jobList.Withdraw;
            creep.memory.target = targetList[0].id;
            return;
        }

    } else {
        if(creep.room.name !== creep.memory.targetRoomName){ // Go to remote room
            creep.memory.job = this.jobList.March;
            creep.memory.marchTarget = creep.memory.targetRoomName;
            return;
        }

        // Store energy
        let target = this.findNextStorage(bee);
        if(target){
            creep.memory.job = this.jobList.Transfer;
            creep.memory.target = target.id;
        } else {
            creep.say("❌ 无储存空间");
        }
    }
};

RemoteTransfer.march = function(bee){
    let creep = bee.creep;
    let targetRoom = new RoomPosition(25, 25, creep.memory.marchTarget); // RoomPosition use roomName instead of name
    if(targetRoom){
        let actionStatus =
            creep.moveTo(targetRoom, {visualizePathStyle: this.visualizePathStyle});
        switch (actionStatus) {
            default:
                if(creep.room.name === targetRoom.roomName){
                    creep.say("⚜️ 到达目标");
                    this.findJob(bee);
                } else{
                    creep.say("🚇 行军中");
                }
        }
    } else {
        this.findJob(bee);
    }
};

RemoteTransfer.findNextStorage = function(bee, currentTargetId){
    let creep = bee.creep; // 临时修正
    let target = undefined;

    // 找到生物容器
    let tempStoreList = DefaultProducer.findExtensionOrSpawn(bee, false);
    tempStoreList = _.sortBy(tempStoreList, s => // Order by L1
        Math.abs(creep.pos.x - s.pos.x) + Math.abs(creep.pos.y - s.pos.y)
    );
    if(currentTargetId){// If has memory, then pick next one for it
        tempStoreList = _.filter(tempStoreList, t => t.id!==currentTargetId);
    }

    target = tempStoreList[0];// Find closest one
    if(target){
        return target;
    }
    // 找到存储器
    tempStoreList = DefaultProducer.findContainerOrStorage(bee, false);
    tempStoreList = _.sortBy(tempStoreList, s => // Order by L1
        Math.abs(creep.pos.x - s.pos.x) + Math.abs(creep.pos.y - s.pos.y)
    );
    if(currentTargetId){// If has memory, then pick next one for it
        tempStoreList = _.filter(tempStoreList, t => t.id!==currentTargetId);
    }

    target = tempStoreList[0];

    if(!target){
        target = bee.myComb.room.storage;
    }
    return target;
};

module.exports.DefaultTransfer = DefaultTransfer;
module.exports.RemoteTransfer = RemoteTransfer;