/*
 * Module code goes here. Use 'module.exports' to export things:
 * module.exports.thing = 'a thing';
 *
 * You can import it from another modules like this:
 * var mod = require('const.gloable');
 * mod.thing == 'a thing'; // true
 */
const GV = {
    SpawnAndExtension : [
        STRUCTURE_EXTENSION,
        STRUCTURE_SPAWN
    ],
    minControllerLevel : 5,
    minTransferStartBuildingCTL : 3,
    minEnergyLine : 700,
    minTickToLive : 35
}
module.exports = GV;