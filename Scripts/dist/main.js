var Minner =  require('role.minner');
var Builder =  require('role.builder');
var Harvester =  require('role.harvester');
var Upgrader =  require('role.upgrader');
var Fixer = require('role.fixer');
var Soldier = require('role.soldier');
var Transfer = require('role.transfer');

var Defender = require('sys.defend');

const CR = require('const.creepRole');
const GV = require('const.gloable');

const Schedule = require('sys.schedule');

const Command = require('function.command');

//Command.eventLog(EVENT_HARVEST);
//Command.buildRemoteHarvester('Home','E39N47');
module.exports.loop = function () {
    
    Schedule.run();
    
    for(var name in Game.creeps) {
        let creep = Game.creeps[name];
        // say raomin!
        if(creep.memory.role == CR.ROLE.Soldier);
        else if(creep.hits < creep.hitsMax){
            //creep.moveTo(26, 19, {visualizePathStyle: {stroke: '#FF0000'}});
            creep.say("😱 好汉饶命!", true);
            //continue;
        } else if(creep.ticksToLive < GV.minTickToLive){
            Command.sendLegancy(creep);
            continue;
        }
        
        switch(creep.memory.role){
            case CR.ROLE.Harvester:
                Harvester.HarvesterAccepter(creep);
                break;
            case CR.ROLE.Minner:
                Minner.run(creep);
                break;
            case CR.ROLE.Builder:
                Builder.run(creep);
                break;
            case CR.ROLE.Upgrader:
                Upgrader.run(creep);
                break;
            case CR.ROLE.Fixer:
                Fixer.FixerAccepter(creep);
                break;
            case CR.ROLE.Soldier:
                Soldier.run(creep);
                break;
            case CR.ROLE.Transfer:
                Transfer.run(creep);
                break;
        }
    }
    
    let tower = Game.getObjectById('5c20ab6ef1f0250746ff487c');
    Defender.run(tower);
    
    // Do Command Manualy
    doCommand(false, false);
}

function doCommand(outputCpuUsed, excute){
    let startCpu;
    if(outputCpuUsed) startCpu = Game.cpu.getUsed();
    
    if(excute){
        // DO Commands here!
        Command.signAController('E38N46', 'Im thinking about to control this room in a few days.');
        
    }
    
    if(outputCpuUsed)console.log('Command Cpu used:',Game.cpu.getUsed() - startCpu);
}
