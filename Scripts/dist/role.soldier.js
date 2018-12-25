/*
 * Module code goes here. Use 'module.exports' to export things:
 * module.exports.thing = 'a thing';
 *
 * You can import it from another modules like this:
 * var mod = require('role.soldier');
 * mod.thing == 'a thing'; // true
 */
var Soldier = {
    minEscapeHealth : 100,
    run(creep){
        if(creep.hitsMax < this.minEscapeHealth || creep.memory.healingSelf){
            creep.moveTo(40, 29);
            creep.say("🤺 撤退!")
            if(creep.pos.isEqualTo(40,29)){
                creep.heal(creep); // heal self until recover
                creep.memory.healingSelf = true;
            }
            if(creep.hits == creep.hitsMax)
                creep.memory.healingSelf = false;
        } else {
            let target = creep.pos.findClosestByRange(FIND_HOSTILE_CREEPS);
            if(target) {
                if(creep.attack(target) == ERR_NOT_IN_RANGE) {
                    //creep.moveTo(target); // Holde Your Position In The Ramport, Soldier!
                    creep.moveTo(37, 38);
                    creep.say("🔪 发起攻击!");
                }
            } else {
                creep.moveTo(38, 37);
                creep.say("🚬 站岗中!");
            }
        }
    }
}
module.exports = Soldier;