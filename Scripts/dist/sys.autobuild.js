/*
 * Module code goes here. Use 'module.exports' to export things:
 * module.exports.thing = 'a thing';
 *
 * You can import it from another modules like this:
 * var mod = require('sys.autobuild');
 * mod.thing == 'a thing'; // true
 */
 
const GV = require('const.gloable');
const CR = require('const.creepRole');
const CreepProducer = require('creep.producer');

function cleanDeadCreepMemory(){
    for(var name in Memory.creeps) {
        if(!Game.creeps[name]) {
            delete Memory.creeps[name];
        }
    }
}

var autoBuilder = {
    
    minHarvesterNum : 1,
    minBuilderNum: 1,
    minUpgraderNum : 1,
    minFixer : 1,
    minSoldier : 0,
    minTransfersNum : 2,
    
    spawnID : 'Home',
    //HomeSpawn : Game.spawns['Home'],
    //HomeRoom : Game.rooms['E38N47'],
    
    setSpawnID(newID){
        this.spawnID = newID;
    },
    
    
    run(){
        // this.cleanDeadCreepMemory();
        
        // Abondaned Method for get creep.role-list
        // var startCpu = Game.cpu.getUsed();
        // var harvesters = _.filter(Game.creeps, c => c.memory.role == CR.ROLE.Harvester);
        // var builders = _.filter(Game.creeps, c => c.memory.role == CR.ROLE.Builder);
        // var upgraders = _.filter(Game.creeps, c => c.memory.role == CR.ROLE.Upgrader);
        // var fixers = _.filter(Game.creeps, c => c.memory.role == CR.ROLE.Fixer);
        // var soldiers = _.filter(Game.creeps, c => c.memory.role == CR.ROLE.Soldier);
        // var transfers = _.filter(Game.creeps, c => c.memory.role == CR.ROLE.Transfer);
        
        var harvesters = [];
        var builders = [];
        var upgraders = [];
        var fixers = [];
        var soldiers = [];
        var transfers = [];
        
        // const startCpu = Game.cpu.getUsed();
        
        // new Method for get creep.role-list
        _.forEach(Game.creeps, s=> {
            switch(s.memory.role) {
                case CR.ROLE.Harvester:
                    if(s.memory.profession != CR.PRO.REMOTE)
                        harvesters.push(s);
                    break;
                case CR.ROLE.Builder:
                    builders.push(s)
                    break;
                case CR.ROLE.Upgrader:
                    upgraders.push(s)
                    break;
                case CR.ROLE.Fixer:
                    fixers.push(s)
                    break;
                case CR.ROLE.Soldier:
                    soldiers.push(s)
                    break;
                case CR.ROLE.Transfer:
                    transfers.push(s)
                    break;
            }
        });
        
        //console.log('sys.autobuild Iterater CPU used:',Game.cpu.getUsed() - startCpu);
        
        let spawnRoom = Game.rooms[Game.spawns[this.spawnID].room.name];
        
        if(harvesters.length < this.minHarvesterNum) {
            if(transfers.length > 0 
                && spawnRoom.controller.level >= GV.minTransferStartBuildingCTL){
                    
                CreepProducer.produce(
                    CR.ROLE.Harvester, CR.PRO.INTENT, [WORK, WORK, WORK, WORK, WORK, WORK, MOVE], 
                    this.spawnID, harvesters.length==1
                );
                this.minHarvesterNum = 1;
            } else {
                CreepProducer.produce(
                    CR.ROLE.Harvester, CR.PRO.DEFAULT, [WORK, WORK, CARRY, CARRY, MOVE, MOVE], 
                    this.spawnID, harvesters.length==1
                );
                this.minHarvesterNum = 5;
            }
            
        }
        
        else if(soldiers.length < this.minSoldier) {
            
            CreepProducer.produce(
                CR.ROLE.Soldier, CR.PRO.DEFAULT, [TOUGH, TOUGH, TOUGH, TOUGH, ATTACK, ATTACK, MOVE, HEAL], 
                this.spawnID, harvesters.length >= 2 
            );// only 2 or more civiliziton nedd to be proteccted
        }
         
        else if(builders.length < this.minBuilderNum) {
            
            CreepProducer.produce(
                CR.ROLE.Builder, CR.PRO.DEFAULT, [WORK, WORK, CARRY, CARRY, MOVE, MOVE], this.spawnID);
        }
        
        else if(upgraders.length < this.minUpgraderNum) {
            
            CreepProducer.produce(
                CR.ROLE.Upgrader, CR.PRO.DEFAULT, [WORK, WORK, MOVE, MOVE, CARRY, CARRY], this.spawnID);
        }
        
        else if(fixers.length < this.minFixer) {
            if(fixers[0] && fixers[0].memory.profession == CR.PRO.ENERGY_FIRST_FIXER){
                CreepProducer.produce(
                    CR.ROLE.Fixer, CR.PRO.DEFAULT, [WORK, CARRY , MOVE], this.spawnID );
            } else {// only one energy-first-fixer
                CreepProducer.produce(
                    CR.ROLE.Fixer, CR.PRO.ENERGY_FIRST_FIXER, [WORK, CARRY , MOVE], this.spawnID );
            }
        }
        
        else if(transfers.length < this.minTransfersNum 
            && spawnRoom.controller.level >= GV.minTransferStartBuildingCTL){
                
            CreepProducer.produce(
                CR.ROLE.Transfer, CR.PRO.DEFAULT, [CARRY, CARRY, CARRY, CARRY, MOVE, MOVE], 
                this.spawnID, false
            );
        }
        
    },
    
    // cleanDeadCreepMemory(){
    //     for(var name in Memory.creeps) {
    //         if(!Game.creeps[name]) {
    //             delete Memory.creeps[name];
    //         }
    //     }
    // }
    
    
}

module.exports.autoBuilder = autoBuilder;
module.exports.cleanDeadCreepMemory = cleanDeadCreepMemory;