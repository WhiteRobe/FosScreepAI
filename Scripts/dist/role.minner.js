;/*
 * Module code goes here. Use 'module.exports' to export things:
 * module.exports.thing = 'a thing';
 *
 * You can import it from another modules like this:
 * var mod = require('role.minner');
 * mod.thing == 'a thing'; // true
 */
var Minner = {
    run(creep){
        creep.say("I'm not ready!")
    }
}
module.exports  = Minner;