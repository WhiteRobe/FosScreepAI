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
            Reserve : 'Reserve',
            Patrol : 'Patrol',
            Attack : 'Attack',
            March : 'March '
        };

        this.visualizePathStyle = {
            stroke: '#FF0000',
            opacity: 0.5
        };

        this.AIName = "AISoldierInterface";
    }

    retreat(bee){
        console.log('Abstract Method:retreat() in AISoldierInterface.class');
    }

    claim(bee){
        console.log('Abstract Method:claim() in AISoldierInterface.class');
    }

    reserve(bee){
        console.log('Abstract Method:reserve() in AISoldierInterface.class');
    }

    patrol(bee){
        console.log('Abstract Method:patrol() in AISoldierInterface.class');
    }

    attack(bee){
        console.log('Abstract Method:attack() in AISoldierInterface.class');
    }

    march(bee){
        let creep = bee.creep;
        let targetRoom = new RoomPosition(25, 25, creep.memory.targetRoomName); // RoomPosition use roomName instead of name
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
                case this.jobList.Retreat:
                    this.retreat(bee);
                    break;
                case this.jobList.Claim:
                    this.claim(bee);
                    break;
                case this.jobList.Reserve:
                    this.reserve(bee);
                    break;
                case this.jobList.Patrol:
                    this.patrol(bee);
                    break;
                case this.jobList.Attack:
                    this.attack(bee);
                    break;
                case this.jobList.March:
                    this.march(bee);
                    break;
                default:
                    creep.say('❌ 未知工作！');
                    break;
            }
        }
    }

}

const DefaultSoldier = new AISoldierInterface();
DefaultSoldier.AIName = "DefaultSoldier";


const RemoteSwordSoldier = new AISoldierInterface();
RemoteSwordSoldier.AIName = "RemoteSwordSoldier";

RemoteSwordSoldier.findJob = function(bee){
    let creep = bee.creep;
    creep.say("🕗 寻找敌人");
    if(creep.room.name !== creep.memory.targetRoomName){
        creep.memory.job = this.jobList.March;
    } else {
        let target = creep.pos.findClosestByRange(FIND_HOSTILE_CREEPS);
        if(target) {
            creep.memory.job = this.jobList.Attack;
            creep.memory.target = target.id;
            return;
        }

        target = creep.pos.findClosestByRange(FIND_HOSTILE_STRUCTURES,{
            filter: s => s.structureType !== STRUCTURE_ROAD
        });
        if(target) {
            creep.memory.job = this.jobList.Attack;
            creep.memory.target = target.id;
            return;
        }

        creep.say("❗ 没有目标!");
    }
};

RemoteSwordSoldier.attack = function(bee){
    let creep = bee.creep;
    let target = Game.getObjectById(creep.memory.target);
    if(target && target.hits > 0){
        let actionStatus = creep.attack(target);
        switch (actionStatus) {
            case ERR_NOT_IN_RANGE:
                creep.moveTo(target, {visualizePathStyle: this.visualizePathStyle});
                creep.say("⚔️ 进攻中!");
                break;
            case ERR_NO_BODYPART:
                creep.say("❌ 没有武器!");
                break;
            case OK:
                creep.say("🗡️ 草泥马!", true);
                break;
            default:
                delete creep.memory.target;
                this.findJob(bee);
        }
    } else {
        creep.say("❗ 没有目标!");
        delete creep.memory.target;
        this.findJob(bee);
    }
};


const ReserveSoldier = new AISoldierInterface();
ReserveSoldier.AIName = "ReserveSoldier";
ReserveSoldier.findJob = function(bee){
    let creep = bee.creep;
    creep.say("🕗 寻找控制器");
    if(creep.room.name !== creep.memory.targetRoomName){
        creep.memory.job = this.jobList.March;
    } else {
        creep.memory.job = this.jobList.Reserve;
    }
};

ReserveSoldier.reserve = function(bee){
    let creep = bee.creep;
    let targetRoom = Game.rooms[creep.memory.targetRoomName];
    if(targetRoom){
        if(targetRoom.controller) {
            let actionStatus = creep.reserveController(creep.room.controller);
            switch (actionStatus) {
                case ERR_NOT_IN_RANGE:
                    creep.moveTo(targetRoom.controller, {visualizePathStyle: this.visualizePathStyle});
                    creep.say("🗝️ 前往控制器!");
                    break;
                case ERR_INVALID_ARGS:
                    creep.say("❌ 请看日志!");
                    console.log(`${Game.time}|${targetRoom.name}: The target is not a valid neutral controller object.`);
                    break;
                case ERR_NO_BODYPART:
                    creep.say("❌ 没有转化器!");
                    break;
                case OK:
                    //creep.say(`⚙️ 进度:${targetRoom.controller.reservation.ticksToEnd}`);
                    creep.say(`⚙️ 保护中!`,true);
                    break;
                default:
                    this.findJob(bee);
            }
        }
    } else {
        this.findJob(bee);
    }

};

module.exports.DefaultSoldier = DefaultSoldier;
module.exports.RemoteSwordSoldier = RemoteSwordSoldier;
module.exports.ReserveSoldier = ReserveSoldier;