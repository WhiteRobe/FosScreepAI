const _ = require('lodash');
const AIInterface = require('interface.ai');
const InterfaceCivilian = require('interface.civilian');

class AIBuilderInterface extends AIInterface{
    constructor(){
        super();
        this.jobList = {
            None : undefined,
            Withdraw : 'Withdraw',
            Upgrade: 'Upgrade',
            March : 'March',
            Build : 'Build'
        };

        this.visualizePathStyle = {
            stroke: '#FF00FF'
        };

        this.AIName = "AIBuilderInterface";
    }

    /**
     * Abstract
     * @param bee
     */
    withdraw(bee){
        console.log('Abstract Method:withdraw() in AIBuilderInterface.class');
    }

    /**
     * Abstract
     * @param bee
     */
    upgrade(bee){
        let creep = bee.creep;
        let room = bee.myComb.room;

        let constructionSite = creep.pos.findClosestByRange(FIND_CONSTRUCTION_SITES);
        if(constructionSite){ // if there is a build-task, then switch to build mode
            creep.memory.job = this.jobList.Build;
            creep.memory.target = constructionSite.id;
            creep.say('📢 获知建筑任务');
            return;
        }

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
    march(bee){
        console.log('Abstract Method:upgrade() in AIBuilderInterface.class');
    }

    build(bee){
        let creep = bee.creep;
        let target = Game.getObjectById(creep.memory.target); // CONSTRUCTION_SITES
        if(target){
            let actionStatus = creep.build(target);
            switch (actionStatus) {
                case ERR_NOT_IN_RANGE:
                    creep.moveTo(target, {visualizePathStyle: this.visualizePathStyle});
                    creep.say("⚒️ 准备建造!");
                    break;
                case OK:
                    if(creep.carry.energy <= 0){
                        delete creep.memory.target;
                        //this.findJob(bee);
                        creep.memory.job = this.jobList.Withdraw;
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
        console.log('Abstract Method:findJob() in AIBuilderInterface.class');
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
                case this.jobList.March:
                    this.march(bee);
                    break;
                case this.jobList.Build:
                    this.build(bee);
                    break;
                default:
                    creep.say('❌ 未知工作！');
                    break;
            }
        }
    }

}

const DefaultBuilder = new AIBuilderInterface();
DefaultBuilder.AIName = "DefaultBuilder";

DefaultBuilder.findJob = function(bee){
    let creep = bee.creep;
    creep.say("🕗 找工作中");
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
        let constructionSite = creep.pos.findClosestByRange(FIND_CONSTRUCTION_SITES);
        if(constructionSite){
            creep.memory.job = this.jobList.Build;
            creep.memory.target = constructionSite.id;
        } else { // If there is no build-task, turn to upgrade controller
            creep.memory.job = this.jobList.Upgrade;
            creep.say('📢 进行升级任务');
        }
    }
};

DefaultBuilder.withdraw = function(bee){
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

const RemoteBuilder = new AIBuilderInterface();
RemoteBuilder.AIName = "RemoteBuilder";

RemoteBuilder.findJob = function(bee){
    let creep = bee.creep;
    creep.say("🕗 找工作中");
    if(creep.carry.energy <= 0){

        if(creep.room.name !== creep.memory.homeRoomName){ // Go back
            creep.memory.job = this.jobList.March;
            creep.memory.marchTarget = creep.memory.homeRoomName;
            return;
        }

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
        if(creep.room.name !== creep.memory.targetRoomName){ // Go to remote room
            creep.memory.job = this.jobList.March;
            creep.memory.marchTarget = creep.memory.targetRoomName;
            return;
        }

        let constructionSite = creep.pos.findClosestByRange(FIND_CONSTRUCTION_SITES);
        if(constructionSite){
            creep.memory.job = this.jobList.Build;
            creep.memory.target = constructionSite.id;
        } else { // If there is no build-task, turn to upgrade controller
            creep.memory.job = this.jobList.Upgrade;
            creep.say('📢 进行升级任务');
        }
    }
};

RemoteBuilder.march = function(bee){
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
    } else{
        this.findJob(bee);
    }
};

RemoteBuilder.withdraw = function(bee){
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

module.exports.DefaultBuilder = DefaultBuilder;
module.exports.RemoteBuilder = RemoteBuilder;