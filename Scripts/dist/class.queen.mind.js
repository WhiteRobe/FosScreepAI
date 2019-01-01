const MK = require('magic.key');
const ClassQueenMind = class {

    constructor(queen){

        this._queen = queen;
    }

    get queen() {
        return this._queen;
    }

    set queen(value) {
        this._queen = value;
    }

    think(){
        let plan = Memory.plan;
        if(plan){

            // 攻击一个房间
            let attackRoomName = plan.attackRoomName;
            if(attackRoomName){
                if(this.queen.homeComb.room.energyAvailable > 1000){
                    let status = this.queen.oviposit({
                        part:[ATTACK, ATTACK, ATTACK, MOVE, MOVE, MOVE], // 420 energy
                        memory:{
                            queenDirectly: true,
                            myCombName: 'Queen',
                            targetRoomName: attackRoomName,
                            occupation: MK.ROLE.Soldier.value,
                            profession: 'RemoteAttack'
                        }
                    });
                    if(status === OK){
                        delete Memory.plan.attackRoomName;
                    }
                }
            }

            // 将一个房间设为保留领地
            let reserveRoomName = plan.reserveRoomName;
            if(reserveRoomName){
                if(this.queen.homeComb.room.energyAvailable > 1500){
                    let status = this.queen.oviposit({
                        part:[CLAIM, MOVE], // 650 energy
                        memory:{
                            queenDirectly: true,
                            myCombName: 'Queen',
                            targetRoomName: reserveRoomName,
                            occupation: MK.ROLE.Soldier.value,
                            profession: 'Reserve'
                        }
                    });
                    if(status === OK){
                        delete Memory.plan.reserveRoomName;
                    }
                }
            }

            // 将一个房间设为占领
            let claimRoomName = plan.claimRoomName;
            if(claimRoomName){
                if(this.queen.homeComb.room.energyAvailable > 1500){
                    let status = this.queen.oviposit({
                        part:[CLAIM, MOVE], // 650 energy
                        memory:{
                            queenDirectly: true,
                            myCombName: 'Queen',
                            targetRoomName: claimRoomName,
                            occupation: MK.ROLE.Soldier.value,
                            profession: 'Claim'
                        }
                    });
                    if(status === OK){
                        delete Memory.plan.claimRoomName;
                    }
                }
            }

            // 前往一个房间建造
            let buildRoomName = plan.buildRoomName;
            if(buildRoomName){
                if(this.queen.homeComb.room.energyAvailable > 1200){
                    let status = this.queen.oviposit({
                        part:[WORK, WORK, CARRY, CARRY, CARRY, CARRY, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE], // 700 energy
                        memory:{
                            queenDirectly: true,
                            myCombName: 'queen',
                            homeRoomName: this.queen.homeRoom,
                            targetRoomName: buildRoomName,
                            occupation: MK.ROLE.Builder.value,
                            profession: 'RemoteBuild'
                        }
                    });
                    if(status === OK){
                        delete Memory.plan.buildRoomName;
                    }
                }
            }

            // 运送能源前往另一个房间
            let transferRoomName = plan.transferRoomName;
            if(transferRoomName){
                if(this.queen.homeComb.room.energyAvailable > 1000){
                    let status = this.queen.oviposit({
                        part:[CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE], // 600 energy
                        memory:{
                            queenDirectly: true,
                            myCombName: 'queen',
                            homeRoomName: this.queen.homeRoom,
                            targetRoomName: transferRoomName,
                            occupation: MK.ROLE.Transfer.value,
                            profession: 'RemoteTransfer'
                        }
                    });
                    if(status === OK){
                        delete Memory.plan.transferRoomName;
                    }
                }
            }
        }
    }
};

module.exports = ClassQueenMind;