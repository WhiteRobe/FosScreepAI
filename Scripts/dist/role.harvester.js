/*
 * Module code goes here. Use 'module.exports' to export things:
 * module.exports.thing = 'a thing';
 *
 * You can import it from another modules like this:
 * var mod = require('role.harvester');
 * mod.thing == 'a thing'; // true
 */
 
const CR = require('const.creepRole');
const ProducerInterface = require('interface.producer');

var DefaultHarvester = {
    
    Harvester_StoreList : [
        STRUCTURE_STORAGE,
        STRUCTURE_CONTAINER,
        STRUCTURE_EXTENSION,
        STRUCTURE_SPAWN
    ],
    
    Harvester_Trans_Priority : {
        'spawn' : 0,
        'extension' : 1,
        'container' : 2,
        'storage' : 3
    },
    
    run(creep){
        if(creep.carry.energy < creep.carryCapacity && !creep.memory.transing){
            var sourceses = creep.room.find(FIND_SOURCES, {
                filter: s => s.energy > 0
            }); // find sources with energy
            
            if(sourceses.length > 0){
                let target = sourceses[0];
                if(creep.harvest(target) == ERR_NOT_IN_RANGE){
                    creep.moveTo(target, {visualizePathStyle: {stroke: '#DAA520'}});
                    creep.say("💰 老子去赚钱啦!");
                }
            } else{
                creep.say("🚩 所有能源已枯竭!");
            }
        } else {
            // creep.drop(RESOURCE_ENERGY);
            // creep.memory.transing = false;
            // return;
            creep.memory.transing = true;
            var energyStores = creep.room.find(FIND_STRUCTURES,{
                filter: (s) => {
                    if(s.structureType == STRUCTURE_CONTAINER){
                        return this.Harvester_StoreList.indexOf(s.structureType)!=-1 && s.store[RESOURCE_ENERGY] < s.storeCapacity
                    } else {
                        return this.Harvester_StoreList.indexOf(s.structureType)!=-1 && s.energy < s.energyCapacity
                    }
                }
            }); // find stores which not full
            
            if(energyStores.length > 0){
                
                energyStores.sort(
                    (a,b) => this.Harvester_Trans_Priority[a.structureType] - this.Harvester_Trans_Priority[b.structureType]
                );
                //for(var i in energyStores)console.log('after',energyStores[i]);
                
                let target = energyStores[0];
                if(creep.transfer(target, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE){
                    creep.moveTo(target, {visualizePathStyle: {stroke: '#DAA520'}});
                    creep.say("🚒 老子在运送资源!");
                } else {
                    if(creep.carry.energy == 0){
                        creep.memory.transing = false;
                        creep.say("✔️️ 运输完毕!");
                    }
                }
            } else {
                creep.say("⁉️ 所有站点都满了!");
            }
        }
    }
}

var IntentHarvester = {
    run(creep){
        var sourceses = creep.room.find(FIND_SOURCES, {
            filter: s => s.energy > 0
        }); // find sources with energy
        
        
        if(sourceses.length > 0){
            let target = sourceses[0];
            if(creep.harvest(target) == ERR_NOT_IN_RANGE){
                creep.moveTo(target, {visualizePathStyle: {stroke: '#DAA520'}});
                creep.say("💰 老子去赚钱啦!");
            }
        } else{
            creep.say("🚩 所有能源已枯竭!");
        }
    }
}

var Command = require('function.command');
var RemoteHarvester = {
    run(creep){
        
        let targetRoomName = creep.memory.targetRoomName;
        if(creep.carry.energy < creep.carryCapacity && !creep.memory.transing){
            if(creep.room.name != targetRoomName){
                return Command.sendCreepTo(creep, targetRoomName);
            } else {
                var source = creep.pos.findClosestByPath(FIND_SOURCES, {
                    filter : s => s.energy > 0,
                    algorithm : 'astar'
                }); // find sources with energy
                if(source){
                    if(creep.harvest(source) == ERR_NOT_IN_RANGE){
                        creep.moveTo(source, {visualizePathStyle: {stroke: '#DAA520'}});
                        creep.say("💰 老子去赚钱啦!");
                    }
                } else {
                    creep.say("🚩 所有能源已枯竭!");
                }
            }
        } else {
            if(creep.room.name != creep.memory.myRoom){
                return Command.sendCreepTo(creep, creep.memory.myRoom);
            } else {
                ProducerInterface.storeEnergy(creep);
            }
        }
    }
}

const HarvesterTypeList = {
    'default' : DefaultHarvester, // shoule be equal to CR.PRO.DEFAULT
    'intent' : IntentHarvester, // shoule be equal to CR.PRO.INTENT
    'remote' : RemoteHarvester // shoule be equal to CR.PRO.REMOTE
}


function HarvesterAccepter(harvesterCreep){
    let creep = harvesterCreep;
    let profession = creep.memory.profession;
    //console.log(profession);
    if(profession == undefined)
        HarvesterTypeList['default'].run(creep);
    else
        HarvesterTypeList[profession].run(creep);
}

module.exports.DefaultHarvester =  DefaultHarvester;
module.exports.IntentHarvester =  IntentHarvester;
module.exports.HarvesterAccepter = HarvesterAccepter;
module.exports.RemoteHarvester = RemoteHarvester;
