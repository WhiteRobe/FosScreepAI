/*
 * Module code goes here. Use 'module.exports' to export things:
 * module.exports.thing = 'a thing';
 *
 * You can import it from another modules like this:
 * var mod = require('role.fixer');
 * mod.thing == 'a thing'; // true
 */
const GV = require('const.gloable'); 
const ComsumerInterface = require('interface.comsumer');

var DefaultFixer = {
    minFixingHits : 55 * 1000,
    Fixer_StoreList : [
        STRUCTURE_CONTAINER,
        STRUCTURE_STORAGE
    ],
    
    run(creep){
        if(creep.carry.energy == 0) {
            let energySources = creep.room.find(FIND_STRUCTURES,{
                filter : s => this.Fixer_StoreList.indexOf(s.structureType)!=-1 && s.store[RESOURCE_ENERGY] > 0
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
            
            let towers = creep.room.find(FIND_STRUCTURES, 
                { 
                    filter : s => s.structureType == STRUCTURE_TOWER &&  s.energy < s.energyCapacity-100
                });
                
            let damagedBuilding = creep.room.find(FIND_STRUCTURES, 
                {   // If there is a tower(CRL>=3), never try to repair road
                    filter: s => s.hits < s.hitsMax && s.hits < this.minFixingHits 
                        && (creep.room.controller.level >=3 ? s.structureType != STRUCTURE_ROAD : true)
                });
                
            // repair first
            if(damagedBuilding.length > 0) {
                damagedBuilding.sort((a,b) => a.hits - b.hits);
                if(creep.repair(damagedBuilding[0]) == ERR_NOT_IN_RANGE) {
                    creep.moveTo(damagedBuilding[0], {visualizePathStyle: {stroke: '#F08080'}});
                    creep.say("🛠️ 修理中!");
                }
            } else if(towers.length > 0){
                let target = towers[0];
                let actionStatus = creep.transfer(target, RESOURCE_ENERGY);
                if(actionStatus == ERR_NOT_IN_RANGE){
                    creep.moveTo(target, {visualizePathStyle: {stroke: '#F08080'}});
                    creep.say("⚡ 补充塔能源");
                }
            }
        }
    }
}

var EnergyFirstFixer = {
    minFixingHits : 55 * 1000,
    Fixer_StoreList : [
        STRUCTURE_CONTAINER,
        STRUCTURE_STORAGE
    ],
    run(creep){
        if(creep.carry.energy == 0) {
            let energySources = creep.room.find(FIND_STRUCTURES,{
                filter : s => this.Fixer_StoreList.indexOf(s.structureType)!=-1 && s.store[RESOURCE_ENERGY] > 0
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
            
            let towers = creep.room.find(FIND_STRUCTURES, 
                { 
                    filter : s => s.structureType == STRUCTURE_TOWER &&  s.energy < s.energyCapacity-50 
                });
                
            let damagedBuilding = creep.room.find(FIND_STRUCTURES, 
                {   // EnergyFirstFixer will never try to repair road
                    filter: s => s.hits < s.hitsMax && s.hits < this.minFixingHits && s.structureType != STRUCTURE_ROAD
                });
                
            // retill energy first
            if(towers.length > 0){
                let target = towers[0];
                let actionStatus = creep.transfer(target, RESOURCE_ENERGY);
                if(actionStatus == ERR_NOT_IN_RANGE){
                    creep.moveTo(target, {visualizePathStyle: {stroke: '#F08080'}});
                    creep.say("⚡ 补充塔能源");
                }
            }
            else if(damagedBuilding.length > 0) {
                damagedBuilding.sort((a,b) => b.hits - a.hits);
                if(creep.repair(damagedBuilding[0]) == ERR_NOT_IN_RANGE) {
                    creep.moveTo(damagedBuilding[0], {visualizePathStyle: {stroke: '#F08080'}});
                    creep.say("🛠️ 修理中!");
                }
            }
        }
    }
}

const FixerTypeList = {
    'default' : DefaultFixer, // shoule be equal to CR.PRO.DEFAULT
    'energyFirstFixer' : EnergyFirstFixer // shoule be equal to CR.PRO.ENERGY_FIRST_FIXER
}
function FixerAccepter(fixerCreep){
    let creep = fixerCreep;
    let profession = creep.memory.profession;
    //console.log(profession);
    if(profession == undefined)
        FixerTypeList['default'].run(creep);
    else
        FixerTypeList[profession].run(creep);
}

module.exports.DefaultFixer = DefaultFixer;
module.exports.EnergyFirstFixer = EnergyFirstFixer;
module.exports.FixerAccepter = FixerAccepter;

