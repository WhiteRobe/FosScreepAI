const _ = require('lodash');
const InterfaceCivilian = require('interface.civilian');

class AIUpgraderInterface {
    constructor(){
        this.jobList = {
            None : undefined,
            Withdraw : 'Withdraw',
            Upgrade : 'Upgrade'
        };

        this.visualizePathStyle = {
            stroke: '#F5FFFA'
        };
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
                    if(creep.carry.energy ===0){
                        // Job is Done
                        creep.memory.job = this.jobList.Withdraw; // Just switch to withdraw to save ticks
                    }
                case ERR_NOT_ENOUGH_RESOURCES:
                default:
                    // Job is valid
                    creep.memory.job = this.jobList.None;
            }
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
        //console.log(Game.time, JSON.stringify(creep.memory.job));
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
const DefaultConsumer = InterfaceCivilian.DefaultConsumer;

const DefaultUpgrader = new AIUpgraderInterface();

DefaultUpgrader.findJob = function (bee) {
    let creep = bee.creep;
    if(creep.energy === 0){
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
    let target = Game.getObjectById(creep.memory.target.id);
    if(target){
        let energy = creep.room.energyAvailable;
        let capacity = creep.room.energyCapacityAvailable;
        let properWithdrawNum = 50;
        let actionStatus = creep.withdraw(target, RESOURCE_ENERGY, properWithdrawNum);
        switch (actionStatus) {
            case ERR_NOT_IN_RANGE:
                creep.moveTo(target, {visualizePathStyle: this.visualizePathStyle});
                creep.say("🧀 获取资源!");
            case OK:

            default:
                creep.memory.job = this.jobList.None;
                delete creep.memory.target;
        }
    } else {
        creep.memory.job = this.jobList.None;
        delete creep.memory.target;
    }
};