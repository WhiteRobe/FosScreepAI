const _ = require('lodash');
const InterfaceCivilian = require('interface.civilian');

class AIFixerInterface {
    constructor(){
        this.jobList = {
            None : undefined,
            Withdraw : 'Withdraw',
            Fix : 'Fix',
            Lorry : 'Lorry',
            Heal : 'Heal'
        };

        this.visualizePathStyle = {
            stroke: '#32CD32'
        };

        this.AIName = "AIFixerInterface";

    }

    /**
     * Abstract
     * @param bee
     */
    heal(bee){
        console.log('Abstract Method:heal() in AIFixerInterface.class');
    }

    /**
     * Abstract
     * @param bee
     */
    withdraw(bee){
        console.log('Abstract Method:withdraw() in AIFixerInterface.class');
    }

    lorry(bee){

    }

    fix(bee){
        let creep = bee.creep;
        let target = Game.getObjectById(creep.memory.target); // CONSTRUCTION_SITES

        if(target && target.hits < target.hitsMax){
            let actionStatus = creep.repair(target);
            console.log(actionStatus);
            switch (actionStatus) {
                case ERR_NOT_IN_RANGE:
                    creep.moveTo(target, {visualizePathStyle: this.visualizePathStyle});
                    creep.say("🛠️ 准备维修!");
                    break;
                case OK:
                    if(creep.carry.energy <= 0){
                        delete creep.memory.target;
                        this.findJob(bee);
                    }
                    break;
                default:
                    // Job done or was valid
                    delete creep.memory.target;
                    this.findJob(bee);
                //creep.memory.job = this.jobList.None;

            }
        } else {
            delete creep.memory.target;
            this.findJob(bee);
        }
    }

    /**
     * Abstract
     * @param bee
     */
    findJob(bee){
        console.log('Abstract Method:findJob() in AIFixerInterface.class');
    }


    run(bee){
        let creep = bee.creep;
        //console.log(Game.time, bee.creepName,  JSON.stringify(creep.memory.job));
        if(!creep.memory.job){
            // Find an job
            this.findJob(bee);
        } else {
            // Do the job
            switch (creep.memory.job) {
                case this.jobList.Withdraw:
                    this.withdraw(bee);
                    break;
                case this.jobList.Fix:
                    this.fix(bee);
                    break;
                case this.jobList.Lorry:
                    this.lorry(bee);
                    break;
                default:
                    creep.say('❌ 未知工作！');
                    break;
            }
        }
    }
}

const DefaultFixer = new AIFixerInterface();
DefaultFixer.AIName = "DefaultFixer";

DefaultFixer.findJob = function(bee){
    let creep = bee.creep;
    if(creep.carry.energy <= 0){
        let target = creep.room.storage;
        if(target){
            creep.memory.job = this.jobList.Withdraw;
            creep.memory.target = target.id;
            return;
        }

        target =  DefaultConsumer.findClosestEnergyStorage(bee);

        if(target){
            creep.memory.job = this.jobList.Withdraw;
            creep.memory.target = target.id;
            return;
        }

    } else {
        let targets = creep.room.find(FIND_STRUCTURES, {
            filter: s => s.hits < s.hitsMax
        });
        if(targets.length>0){
            targets = _.sortBy(targets, s => s.hits);
            creep.memory.job = this.jobList.Fix;
            creep.memory.target = targets[0].id;
        } else {
            targets = creep.room.find(FIND_STRUCTURES, {
                filter: s => s.structureType === STRUCTURE_TOWER && s.energy <= s.energyCapacity - 50
            });
            if(targets.length>0){
                creep.memory.job = this.jobList.Lorry;
                creep.memory.target = targets[0].id;
            } else {
                creep.say('🌙 休息中.');
            }
        }
    }
};

DefaultFixer.withdraw = function(bee){
    let creep = bee.creep;
    let target = Game.getObjectById(creep.memory.target);
    if(target &&
        ( target.energy && target.energy < target.energyCapacity // hot-fix spawn or extension
        || target.store && target.store[RESOURCE_ENERGY] < target.storeCapacity)){
        let energy = creep.room.energyAvailable;
        let capacity = creep.room.energyCapacityAvailable;
        let properWithdrawNum = energy-Math.ceil(0.5 * capacity);
        let actionStatus = creep.withdraw(target, RESOURCE_ENERGY,
            Math.min(properWithdrawNum, creep.carryCapacity)-creep.carry[RESOURCE_ENERGY]);
        switch (actionStatus) {
            case ERR_NOT_IN_RANGE:
                creep.moveTo(target, {visualizePathStyle: this.visualizePathStyle});
                creep.say("🧀 获取资源!");
                break;
            case OK:
            default:
                // Job done or was valid
                delete creep.memory.target;
                this.findJob(bee);
            //creep.memory.job = this.jobList.None;

        }
        // console.log('UpgraderLog',Game.time, creep.name,`${creep.pos.x},${creep.pos.y}` ,JSON.stringify(creep.carry), actionStatus, target.structureType);
    } else {
        // Job is valid
        delete creep.memory.target;
        this.findJob(bee);
        //creep.memory.job = this.jobList.None;
    }
};

DefaultFixer.lorry = function(bee){
    let creep = bee.creep;
    let target = Game.getObjectById(creep.memory.target); // CONSTRUCTION_SITES
    if(target && target.energy < target.energyCapacity){
        let actionStatus = creep.transfer(target,RESOURCE_ENERGY);
        switch (actionStatus) {
            case ERR_NOT_IN_RANGE:
                creep.moveTo(target, {visualizePathStyle: this.visualizePathStyle});
                creep.say("⚡ 准备充能!");
                break;
            case OK:
                if(creep.carry.energy <= 0){
                    delete creep.memory.target;
                    this.findJob(bee);
                }
                break;
            default:
                // Job done or was valid
                delete creep.memory.target;
                this.findJob(bee);
            //creep.memory.job = this.jobList.None;

        }
    } else {
        delete creep.memory.target;
        this.findJob(bee);
    }
};

module.exports.DefaultFixer = DefaultFixer;