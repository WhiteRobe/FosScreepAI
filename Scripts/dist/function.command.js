/*
 * Module code goes here. Use 'module.exports' to export things:
 * module.exports.thing = 'a thing';
 *
 * You can import it from another modules like this:
 * var mod = require('function.command');
 * mod.thing == 'a thing'; // true
 */
const CR = require('const.creepRole');

function signAController(roomName, str){
    //console.log(creep, roomPos);
    str = str || "[Love & Peace] from FosRodia";
    let spawn = Game.spawns['Home'];
    let creep = Game.creeps['scout_sign_a_control'];
    if(!creep && !spawn.spawning){
        spawn.spawnCreep([MOVE], 'scout_sign_a_control');
        return ;
    }
    
    if(creep.pos.roomName != roomName){
        sendCreepTo(creep, roomName);
        // let targetRoom = new RoomPosition(25,25, roomName);
        // creep.moveTo(targetRoom, {visualizePathStyle: {stroke: '#FF1493'}});
        // creep.say("📲 "+roomName);
    } else {
        if(creep.room.controller) {
            let actionStatus = creep.signController(creep.room.controller, str);
            if(actionStatus == ERR_NOT_IN_RANGE) {
                creep.moveTo(creep.room.controller, {visualizePathStyle: {stroke: '#FF1493'}});
                creep.say("🔶 标记中...");
            } else if(actionStatus == OK){
                creep.say("🔷 标记完毕!");
            }
        }
    }
}

function sendCreepTo(creep, roomName){
    if(!creep) return ;
    else {
        let targetRoom = new RoomPosition(25,25, roomName);
        creep.moveTo(targetRoom, {visualizePathStyle: {stroke: '#FF1493'}});
        creep.say("📲 "+roomName+" .");
    }
}

function buildRemoteHarvester(spawnID, targetRoom){
    let spawn = Game.spawns[spawnID];
    let creepType = CR.ROLE.Harvester;
    
    if(spawn.spawning!=null){ 
        console.log('command:buildRemoteHarvester','Err:spawn.spawning')
        return;
    }
    
    let newName = 'R_'+creepType + Game.time;
    let status = spawn.spawnCreep(
        [WORK, MOVE, MOVE, CARRY], newName, 
        {
            memory: {
                role : creepType,
                profession : CR.PRO.REMOTE,
                myRoom : spawn.room.name,
                targetRoomName : targetRoom
            },
            directions : [TOP_RIGHT, RIGHT, BOTTOM_RIGHT, BOTTOM]
        }
    );
    console.log("command:remote harvester build:", newName, status, spawn.room.energyAvailable);
}

function sendLegancy(creep){
    let StoreList = [
        STRUCTURE_STORAGE,
        STRUCTURE_CONTAINER,
        STRUCTURE_EXTENSION,
        STRUCTURE_SPAWN
    ];
    if(creep.carry.energy > 0){
        let energyStores = creep.room.find(FIND_STRUCTURES,{
            filter: (s) => {
                if(s.structureType == STRUCTURE_CONTAINER){
                    return StoreList.indexOf(s.structureType)!=-1 && s.store[RESOURCE_ENERGY] < s.storeCapacity
                } else {
                    return StoreList.indexOf(s.structureType)!=-1 && s.energy < s.energyCapacity
                }
            }
        });
        // console.log(energyStores.length);
        if(energyStores.length>0){
            let target = energyStores[0];
            if(creep.transfer(target, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE){
                creep.moveTo(target, {visualizePathStyle: {stroke: '#DAA520'}});
                creep.say("🥨 老子在运送遗产!");
            }
        } 
    } else {
        creep.memory.isDying = true;
        creep.moveTo(30, 24, {visualizePathStyle: {stroke: '#FF0000'}});
        if(creep.ticksToLive < 20){
            let actionStatus = Game.spawns['Home'].recycleCreep(creep);
            if(actionStatus == OK) {
                //AutoBuild.run();
                console.log("command:CreepRecycled", creep.name, actionStatus);
            }
        }
        creep.say("💊 我要死了!", true);
    }
}

function eventLog(eventToLog){
    console.log('Print Log:');
    _.forEach(Game.rooms, room => {
        let eventLog = room.getEventLog();
        let events = _.filter(eventLog, {event: eventToLog});
        events.forEach(event => {
            let target = Game.getObjectById(event.targetId);
            console.log(event.data);
        });
    });
}

module.exports.signAController = signAController;
module.exports.sendLegancy = sendLegancy;
module.exports.sendCreepTo = sendCreepTo;
module.exports.eventLog = eventLog;
module.exports.buildRemoteHarvester = buildRemoteHarvester;