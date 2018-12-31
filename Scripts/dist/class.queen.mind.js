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
                        part:[CLAIM, MOVE], // 420 energy
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
        }
    }
};

module.exports = ClassQueenMind;