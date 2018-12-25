/*
 * Module code goes here. Use 'module.exports' to export things:
 * module.exports.thing = 'a thing';
 *
 * You can import it from another modules like this:
 * var mod = require('sys.schedule');
 * mod.thing == 'a thing'; // true
 */
var AutoBuild = require('sys.autobuild');

const Command = require('function.command');

module.exports = {
    run(){
        let clock = Game.time % 10;
        switch(clock){
            case 0:
                // every %{var} tick do check respwan
                AutoBuild.autoBuilder.run();
                break;
            case 1:
                AutoBuild.cleanDeadCreepMemory();
                break;
            case 2:
                //Command.buildRemoteHarvester('Home','E38N46');
                break;
        }
        
        
        // always keep one alive remote-harvester in each targetRoom
        // if(Game.time % 750 == 1 && Game.rooms['E38N47'].controller.level >= 3 
        //     && Game.rooms['E38N47'].energyCapacityAvailable - Game.rooms['E38N47'].energyAvailable < 200
        // ){
        //     Command.buildRemoteHarvester('Home','E39N47');
        // }
        // if(Game.time % 750 == 21 && Game.rooms['E38N47'].controller.level >= 3 
        //     && Game.rooms['E38N47'].energyCapacityAvailable - Game.rooms['E38N47'].energyAvailable < 200
        // ){
        //     Command.buildRemoteHarvester('Home','E38N46');
        // }
    }
};