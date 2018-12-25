/*
 * Module code goes here. Use 'module.exports' to export things:
 * module.exports.thing = 'a thing';
 *
 * You can import it from another modules like this:
 * var mod = require('role.transfer');
 * mod.thing == 'a thing'; // true
 */
var Transfer = {
    Transfer_StoreList : [
        STRUCTURE_STORAGE,
        STRUCTURE_CONTAINER,
        STRUCTURE_EXTENSION,
        STRUCTURE_SPAWN
    ],
    
    Transfer_Trans_Priority : {
        'spawn' : 0,
        'extension' : 1,
        'container' : 2,
        'storage' : 3
    },
    
    run(creep){
        if(creep.carry.energy < creep.carryCapacity && !creep.memory.transing){
            let lostResources = creep.room.find(FIND_DROPPED_RESOURCES);
            if(lostResources.length > 0) {
                lostResources.sort((a, b) => b.amount- a.amount);
                let target = lostResources[0];
                let actionStatus = creep.pickup(lostResources[0]);
                if(actionStatus == ERR_NOT_IN_RANGE) {
                    creep.moveTo(target, {visualizePathStyle: {stroke: '#D2691E'}});
                    creep.say("🐈 捡东西去!");
                }
            } else creep.say("🌙 待命中..");
        } else {
            creep.memory.transing = true;
            var energyStores = creep.room.find(FIND_STRUCTURES,{
                filter: (s) => {
                    if(s.structureType == STRUCTURE_CONTAINER){
                        return this.Transfer_StoreList.indexOf(s.structureType)!=-1 && s.store[RESOURCE_ENERGY] < s.storeCapacity
                    } else {
                        return this.Transfer_StoreList.indexOf(s.structureType)!=-1 && s.energy < s.energyCapacity
                    }
                }
            }); // find stores which not full
            
            if(energyStores.length > 0){
                
                energyStores.sort(
                    (a,b) => this.Transfer_Trans_Priority[a.structureType] - this.Transfer_Trans_Priority[b.structureType]
                );
                //for(var i in energyStores)console.log('after',energyStores[i]);
                
                let target = energyStores[0];
                if(creep.transfer(target, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE){
                    creep.moveTo(target, {visualizePathStyle: {stroke: '#D2691E'}});
                    creep.say("🛴 上交中...");
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


module.exports = Transfer;

