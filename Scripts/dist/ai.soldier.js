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
            March : 'March ',
            Sign : 'Sign'
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

    sign(bee){
        console.log('Abstract Method:sign() in AISoldierInterface.class');
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
                case this.jobList.Sign:
                    this.sign(bee);
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

DefaultSoldier.findJob = function (bee) {
    let creep = bee.creep;

    // Find if I was in rampart, if not, go for cover
    let myPos = creep.pos.look();
    let inRampart = false;
    for(let i in myPos){
        let terrain = myPos[i];
        if(terrain.structure && terrain.structure.structureType===STRUCTURE_RAMPART){
            inRampart = true;
            break;
        }
    }
    if(!inRampart){
        let target = creep.room.find(FIND_MY_STRUCTURES,{
            filter : s => s.structureType === STRUCTURE_RAMPART
        });
        if(target[0]){
            creep.memory.job = this.jobList.March;
            creep.memory.target = target[0].id;
            return;
        }
    }

    // Else, find enemy
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


    creep.say("🔱 警戒中!");
};

DefaultSoldier.attack = function(bee){
    let creep = bee.creep;
    let target = Game.getObjectById(creep.memory.target);
    if(target && target.hits > 0){
        let actionStatus = creep.rangedAttack(target);
        switch (actionStatus) {
            case ERR_NOT_IN_RANGE:
                creep.moveTo(target, {visualizePathStyle: this.visualizePathStyle});
                creep.say("⚔️ 进攻中!");
                break;
            case ERR_NO_BODYPART:
                creep.say("❌ 没有武器!");
                break;
            case OK:
                creep.say("🏹 我特么射爆!", true);
                break;
            default:
                delete creep.memory.target;
                this.findJob(bee);
        }
    } else {
        creep.say("❗ 目标消失!");
        delete creep.memory.target;
        this.findJob(bee);
    }
};

DefaultSoldier.march = function (bee) {
    let creep = bee.creep;
    let target = Game.getObjectById(creep.memory.target);
    if(target){
        creep.moveTo(target);
        creep.say("⛑️ 前往堡垒!");
        if(creep.pos.isEqualTo(target.pos)){
            creep.say("⛑️ 进入堡垒!");
            delete creep.memory.target;
            this.findJob(bee);
        }

    } else {
        creep.say("⁉️ 堡垒不存在!");
        delete creep.memory.target;
        this.findJob(bee);
    }
};

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
        creep.say("❗ 目标消失!");
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

const ClaimSoldier = new AISoldierInterface();
ClaimSoldier.AIName = "ClaimSoldier";

ClaimSoldier.findJob = function(bee){
    let creep = bee.creep;
    creep.say("🕗 寻找控制器");
    if(creep.room.name !== creep.memory.targetRoomName){
        creep.memory.job = this.jobList.March;
    } else {
        creep.memory.job = this.jobList.Claim;
    }
};

ClaimSoldier.claim = function(bee){
    let creep = bee.creep;
    let targetRoom = Game.rooms[creep.memory.targetRoomName];
    if(targetRoom){
        if(targetRoom.controller) {
            let actionStatus = creep.claimController(creep.room.controller);
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
                    creep.say(`🚩 占领中!`,true);
                    break;
                default:
                    this.findJob(bee);
            }
        }
    } else {
        this.findJob(bee);
    }

};

const SignerSoldier = new AISoldierInterface();

SignerSoldier.findJob = function(bee){
    let creep = bee.creep;
    creep.say("🕗 寻找控制器");
    if(creep.room.name !== creep.memory.targetRoomName){
        creep.memory.job = this.jobList.March;
    } else {
        creep.memory.job = this.jobList.Sign;
    }
};

SignerSoldier.sign = function(bee){
    let creep = bee.creep;
    let controller = creep.room.controller;
    if(controller){
        let actionStatus = creep.signController(controller, ''+Memory.signMsg);
        switch (actionStatus) {
            case ERR_NOT_IN_RANGE:
                creep.moveTo(controller, {visualizePathStyle: this.visualizePathStyle});
                creep.say('🔹 标记房间...');
                break;
            case OK:
                Game.notify(`${Game.time}|${creep.room.name}: 标记完毕-${Memory.signMsg}`, 10);
                this.findJob(bee);
                break;
            default:
                this.findJob(bee);
        }
    } else {
        creep.say('❌ 没有目标!');
        this.findJob(bee);
    }
};

module.exports.DefaultSoldier = DefaultSoldier;
module.exports.RemoteSwordSoldier = RemoteSwordSoldier;
module.exports.ReserveSoldier = ReserveSoldier;
module.exports.ClaimSoldier = ClaimSoldier;
module.exports.SignerSoldier = SignerSoldier;