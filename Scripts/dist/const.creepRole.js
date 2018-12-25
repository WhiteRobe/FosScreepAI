/*
 * Module code goes here. Use 'module.exports' to export things:
 * module.exports.thing = 'a thing';
 *
 * You can import it from another modules like this:
 * var mod = require('const.creepRole');
 * mod.thing == 'a thing'; // true
 */
 
const CREEP_ROLE_NAME = {
    Harvester : 'harvester',
    Minner : 'minner',
    Builder : 'builder',
    Upgrader : 'upgrader',
    Fixer : 'fixer',
    Soldier : 'soldier',
    Transfer : 'transfer'
}

const CREPP_ROLE_PRO = {
    DEFAULT : 'default',
    INTENT : 'intent',
    REMOTE : 'remote',
    ENERGY_FIRST_FIXER : 'energyFirstFixer'
}

module.exports.ROLE = CREEP_ROLE_NAME;
module.exports.PRO = CREPP_ROLE_PRO;