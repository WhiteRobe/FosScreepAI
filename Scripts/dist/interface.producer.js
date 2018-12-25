/*
 * Module code goes here. Use 'module.exports' to export things:
 * module.exports.thing = 'a thing';
 *
 * You can import it from another modules like this:
 * var mod = require('interface.producer');
 * mod.thing == 'a thing'; // true
 */
var ProducerInterface = {
    Producer_StoreList : [
        STRUCTURE_STORAGE,
        STRUCTURE_CONTAINER,
        STRUCTURE_EXTENSION,
        STRUCTURE_SPAWN
    ],
    
    Producer_Trans_Priority : {
        'spawn' : 0,
        'extension' : 1,
        'container' : 2,
        'storage' : 3
    },
    
    store(creep){
        
    },
    
    /*
        Creep will find creep.room' storeges and store energy
        Will set {creep.memory.transing} if on transfering
    */
    storeEnergy(creep){
        // set transing TRUE
        creep.memory.transing = true;
        
        var energyStores = creep.room.find(FIND_STRUCTURES,{
            filter: (s) => {
                if(s.structureType == STRUCTURE_SPAWN || s.structureType == STRUCTURE_EXTENSION){
                    return this.Producer_StoreList.indexOf(s.structureType)!=-1 && s.energy < s.energyCapacity
                } else {
                    return this.Producer_StoreList.indexOf(s.structureType)!=-1 && s.store[RESOURCE_ENERGY] < s.storeCapacity
                }
            }
        }); // find stores/extensions which not full
        
        if(energyStores.length > 0){
            
            // sore by priority
            energyStores.sort(
                (a,b) => this.Producer_Trans_Priority[a.structureType] - this.Producer_Trans_Priority[b.structureType]
            );
            
            let target = energyStores[0];
            if(creep.transfer(target, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE){
                creep.moveTo(target, {visualizePathStyle: {stroke: '#DAA520'}});
                creep.say("🚒 老子在运送资源!");
            } else {
                if(creep.carry.energy == 0){
                    creep.memory.transing = false; // transfer action is over
                    creep.say("✔️️ 运输完毕!");
                }
            }
        } else {
            creep.say("⁉️ 所有站点都满了!");
        }
    }
}
module.exports = ProducerInterface;