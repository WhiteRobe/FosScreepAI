const _ = require('lodash');
const AIInterface = require('interface.ai');

class AIUpgraderInterface extends AIInterface{
    constructor(){
        super();
        this.jobList = {
            None : undefined,
            Withdraw : 'Withdraw',
            Upgrade : 'Upgrade'
        };

        this.visualizePathStyle = {
            stroke: '#F5FFFA'
        };

        this.AIName = "AIUpgraderInterface";
    }

    /**
     * Abstract
     * @param bee
     */
    withdraw(bee){
        console.log('Abstract Method:withdraw() in AIUpgraderInterface.class');
    }

    upgrade(bee){
        let creep = bee.creep;
        let room = bee.myComb.room;
        if (!room.controller) {
            creep.say("📛 控制器不存在!");
            creep.memory.job = this.jobList.None;
        } else {
            let actionStatus = creep.upgradeController(room.controller);
            switch (actionStatus) {
                case ERR_NOT_IN_RANGE:
                    creep.moveTo(room.controller, {visualizePathStyle: this.visualizePathStyle});
                    creep.say("🔰 升级控制器!");
                    break;
                case OK:
                    if(creep.carry.energy === 0){
                        // Job is Done
                        creep.memory.job = this.jobList.Withdraw; // Just switch to withdraw to save ticks
                    }
                    break;
                case ERR_NOT_ENOUGH_RESOURCES:
                default:
                    // Job is valid
                    //creep.memory.job = this.jobList.None;
                    this.findJob(bee);
            }
            // console.log('UpgraderLog',Game.time, creep.name,`${creep.pos.x},${creep.pos.y}` ,JSON.stringify(creep.carry), actionStatus, room.controller);
        }
    }

    /**
     * Abstract
     * @param bee
     */
    findJob(bee){
        console.log('Abstract Method:findJob() in AIUpgraderInterface.class');
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
                case this.jobList.Withdraw:
                    this.withdraw(bee);
                    break;
                case this.jobList.Upgrade:
                    this.upgrade(bee);
                    break;
                default:
                    creep.say('❌ 未知工作！');
                    break;
            }
        }
    }
}

const InterfaceCivilian = require('interface.civilian');
const DefaultConsumer = InterfaceCivilian.DefaultConsumer;

/**
 * DefaultUpgrader always try to upgrade controller,
 * find energy in the room in which the controller located
 *
 * @type {AIUpgraderInterface}
 */
const DefaultUpgrader = new AIUpgraderInterface();
DefaultUpgrader.AIName = "DefaultUpgrader";

DefaultUpgrader.findJob = function (bee) {
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
        creep.memory.job = this.jobList.Upgrade;
    }
};

DefaultUpgrader.withdraw = function (bee) {
    let creep = bee.creep;
    let target = Game.getObjectById(creep.memory.target);
    if(target){
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

module.exports.DefaultUpgrader = DefaultUpgrader;