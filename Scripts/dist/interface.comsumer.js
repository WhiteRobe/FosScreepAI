/*
 * Module code goes here. Use 'module.exports' to export things:
 * module.exports.thing = 'a thing';
 *
 * You can import it from another modules like this:
 * var mod = require('interface.comsumer');
 * mod.thing == 'a thing'; // true
 */

const GV = require('const.gloable'); 
var ComsumerInterface = {
    
    /*
        creep : creep Instance
        energySources : withdrwa from these Store Structures
        limit : undefine->allCapbility; shoule be number
        closest : sort {energySources} by distance(L1)
    */
    withdraw(creep, energySources, limit, closest){
        if(limit<=0 && creep.room.energyAvailable <= GV.minEnergyLine){
            //creep.say("📌 资源未准备好");
            return false;
        }
        
        if(closest){
            // 按从远到近排序资源建筑
            energySources = this.findClosedTarget(creep, energySources);
        }
            
        let target = energySources[0];
        let actionStatus = limit==undefined ? 
            creep.withdraw(target, RESOURCE_ENERGY) :
            creep.withdraw(target, RESOURCE_ENERGY, limit);
        //console.log(limit);
        
        if(actionStatus == ERR_NOT_IN_RANGE) {
            creep.moveTo(target, {visualizePathStyle: {stroke: '#BA55D3'}});
            creep.say("🧀 获取需要的资源!");
        }
        return true;
    },
    
    /*
        sort {energySources} by distance(L1)
    */
    findClosedTarget(creep, energySources){
        energySources.sort(
            (a,b) => 
                Math.abs(creep.pos.x - a.pos.x) + Math.abs(creep.pos.y - a.pos.y) - 
                Math.abs(creep.pos.x - b.pos.x) - Math.abs(creep.pos.y - b.pos.y)
        );
        return energySources;
    }
}
module.exports = ComsumerInterface;