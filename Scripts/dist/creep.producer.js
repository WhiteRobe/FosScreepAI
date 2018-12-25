/*
 * Module code goes here. Use 'module.exports' to export things:
 * module.exports.thing = 'a thing';
 *
 * You can import it from another modules like this:
 * var mod = require('creep.producer');
 * mod.thing == 'a thing'; // true
 */
const CR = require('const.creepRole');

var CreepProducer = {
    produce(   
        creepType,
        proType,
        part,
        spawnID,
        forceProduce
    ){
        forceProduce = forceProduce || false;
        // console.log(spawnID, roomID);
        let spawn = Game.spawns[spawnID];
        if(spawn.spawning!=null) return;
        let newName = creepType + Game.time;
        let status = spawn.spawnCreep(
            part, newName, 
            {
                memory: {
                    role : creepType,
                    profession : proType,
                    myRoom : spawn.room.name
                },
                directions : [TOP_RIGHT, RIGHT, BOTTOM_RIGHT, BOTTOM]
            }
        );
        
        if(status == ERR_NOT_ENOUGH_ENERGY){
            if(forceProduce) // 紧急制造 
                this.emergenceProduce(creepType, spawnID); // creat default PARTS'creep with energy:200
        }
        
        console.log("creep.producer:创建新人口", 
            newName, proType, part, this.spawnCreepError['_' + Math.abs(status)], spawn.room.energyAvailable);
    },
    
    emergenceProduce(creepType, spawnID){
        let part = [WORK, CARRY, MOVE];
        if(this.civilization.indexOf(creepType)!=-1)
            part = [WORK, CARRY, MOVE];
        else if(this.soldiers.indexOf(creepType)!=-1)
            part = [ATTACK, MOVE, TOUGH];
            
        let spawn = Game.spawns[spawnID];
        if(spawn.spawning!=null) return;
        let newName = creepType + Game.time;
        let status = spawn.spawnCreep(
            part, newName, 
            {
                memory: {
                    role : creepType,
                    profession : 'default',
                    myRoom : spawn.room.name
                },
                directions : [TOP_RIGHT, RIGHT, BOTTOM_RIGHT, BOTTOM]
            }
        );
        
        if(status != OK){
            console.log("creep.producer:紧急生产人口失败", 
                newName, proType, part, this.spawnCreepError['_' + Math.abs(status)], spawn.room.energyAvailable);
        }
        
    },
    
    civilization : [
        CR.ROLE.Harvester,
        CR.ROLE.Minner,
        CR.ROLE.Builder,
        CR.ROLE.Upgrader,
        CR.ROLE.Fixer,
        CR.ROLE.Transfer
    ],
    
    soldiers : [
        CR.ROLE.Soldier
    ],
    
    spawnCreepError:{
        _0:'OK',
        _1:'ERR_NOT_OWNER',
        _3:'ERR_NAME_EXISTS',
        _4:'ERR_BUSY',
        _6:'ERR_NOT_ENOUGH_ENERGY',
        _10:'ERR_INVALID_ARGS',
        _14:'ERR_RCL_NOT_ENOUGH'
    }
    
}
module.exports = CreepProducer;