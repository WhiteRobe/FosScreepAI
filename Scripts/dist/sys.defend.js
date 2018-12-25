/*
 * Module code goes here. Use 'module.exports' to export things:
 * module.exports.thing = 'a thing';
 *
 * You can import it from another modules like this:
 * var mod = require('sys.defend');
 * mod.thing == 'a thing'; // true
 */
var Defender = {
    run(tower){
        // Use Tower To Attack Closest Hostile
        let closestHostile = tower.pos.findClosestByRange(FIND_HOSTILE_CREEPS);
        if(closestHostile) {
            tower.attack(closestHostile);
        }
        
        // Use Tower To Repair Road
        let roadsToRepair = tower.room.find(FIND_STRUCTURES, {
            filter: s => s.structureType == STRUCTURE_ROAD && s.hits < s.hitsMax
        });
        
        if(roadsToRepair.length > 0) {
            tower.repair(roadsToRepair[0]);
        }
        
        // every 17 tick try to heal creep
        if(Game.time % 17 ==0){
            let creepNotHealth = tower.pos.findClosestByRange(FIND_CREEPS, {
                filter: c => c.hits < c.hitsMax
            });
            if(creepNotHealth) {
                tower.heal(creepNotHealth);
            }
        }
    }
}

module.exports = Defender;