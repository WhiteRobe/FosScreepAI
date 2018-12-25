/*
 * Module code goes here. Use 'module.exports' to export things:
 * module.exports.thing = 'a thing';
 *
 * You can import it from another modules like this:
 * var mod = require('role.builder');
 * mod.thing == 'a thing'; // true
 */
const GV = require('const.gloable'); 
const ComsumerInterface = require('interface.comsumer');

var Builder = {
    Builder_StoreList : [
        STRUCTURE_CONTAINER,
        STRUCTURE_STORAGE
    ],
    
    run(creep){
        
        if(creep.carry.energy == 0) {
            
            let energySources = creep.room.find(FIND_STRUCTURES,{
                filter : s => this.Builder_StoreList.indexOf(s.structureType)!=-1 && s.store[RESOURCE_ENERGY] > 0
            }); // find stores which have energy

            if(energySources.length > 0) {
                ComsumerInterface.withdraw(creep, energySources, undefined, true);
            } else {

                energySources = creep.room.find(FIND_STRUCTURES,{
                    filter : s => GV.SpawnAndExtension.indexOf(s.structureType)!=-1 && s.energy > 0
                });

                if(energySources.length > 0){
                    ComsumerInterface.withdraw(creep, energySources, Math.min(creep.room.energyAvailable-GV.minEnergyLine, creep.carryCapacity));
                } else {
                    creep.say("🍗 基地资源不足!");
                }
            }
        } else {
            
            let targets = creep.room.find(FIND_MY_CONSTRUCTION_SITES);
            
            //console.log(actionStatus);
            if(targets.length > 0){
                let actionStatus = creep.build(targets[0]);
                if(actionStatus == ERR_NOT_IN_RANGE) {
                    creep.moveTo(targets[0], {visualizePathStyle: {stroke: '#BA55D3'}});
                    creep.say("⚒️ 老子去盖楼!");
                }
            } else {
                // do upgrader
                if(creep.upgradeController(creep.room.controller) == ERR_NOT_IN_RANGE){
                    creep.moveTo(creep.room.controller, {visualizePathStyle: {stroke: '#BA55D3'}});
                    creep.say("🔰 升级控制器!");
                }
            }
            
        }
    }
}

module.exports = Builder;