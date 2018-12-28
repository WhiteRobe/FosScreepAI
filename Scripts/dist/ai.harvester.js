const _ = require('lodash');

class AIHarvesterInterface {
    constructor(){
        this.jobList = {
            None : undefined,
            Transfer : 'Transfer',
            Harvest : 'Harvest'
        };

        this.visualizePathStyle = {
            stroke: '#DAA520'
        };
    }

    transfer(bee){

    }

    harvest(bee){

    }

    findJob(bee){

    }

    run(bee){

    }
}

const InterfaceCivilian = require('interface.civilian');
const DefaultProducer = InterfaceCivilian.DefaultProducer;

/**
 *
 * @type {AIHarvesterInterface}
 */
const DefaultHarvester = new AIHarvesterInterface();

/**
 * IntentHarvester.class will focus on harvest
 * When carry is full, he will drop all of the resources
 * if there are no container nearby
 *
 * @type {AIHarvesterInterface}
 */
const IntentHarvester = new AIHarvesterInterface();
IntentHarvester.findJob = function(bee){
    let creep = bee.creep;
    if(creep.carry.energy === creep.carryCapacity){
        creep.memory.job = this.jobList.Transfer;
    } else {
        // Find an resources, order by amount or sort by L1
        // So, there will be two situation:
        // 1.Bee is newborn, he will find the Energy-Source with less harvester around
        // 2.Keep stay in position, until the Energy-Source nearby to be refreshed

        let sources = [];
        if(creep.pos.findInRange(FIND_MY_SPAWNS,1).length >0){
            sources = _.orderBy(bee.myComb.resources.sources,['mount'], ['desc']);
        } else {
            sources = _.sortBy(sources, r =>
                Math.abs(creep.pos.x - r.pos.x) + Math.abs(creep.pos.y - r.pos.y)
            );
        }

        let target = sources[0];
        if(target){
            creep.memory.target = target.id;
            creep.memory.job = this.jobList.Harvest;
        } else {
            creep.say('❌ 房间里无能源点!');
        }
    }
};

IntentHarvester.transfer = function(bee){
    let creep = bee.creep;
    // Find an container in range 1
    let containers = creep.pos.findInRange(FIND_STRUCTURES, 1);
    containers = _.filter(containers, s => s.structureType === STRUCTURE_CONTAINER);
    let target = containers[0];
    if(target){
        creep.transfer(target, RESOURCE_ENERGY); // in range 1
        creep.say("⛽ 暂存资源！");
    }

    if(creep.carry.energy > 0){ // Any way, in this tick just drop all the resources
        creep.drop(RESOURCE_ENERGY);
        creep.say("🌝 丢弃资源！");
    }

    creep.memory.job = this.jobList.None; // Job is done
};

IntentHarvester.harvest = function(bee){
    let creep = bee.creep;
    let target = Game.getObjectById(creep.memory.target);
    if(target){
        let actionStatus = creep.harvest(target);
        switch (actionStatus) {
            case ERR_NOT_IN_RANGE:
                creep.moveTo(target,{ visualizePathStyle:this.visualizePathStyle });
                creep.say('🚒 运送能源!');
                break;
            case OK:
                if(creep.carry.energy === creep.carryCapacity){// Job is done
                    creep.memory.job = this.jobList.None;
                    delete creep.memory.target;
                }
                break;
            case ERR_TIRED:
            case ERR_NOT_ENOUGH_RESOURCES:
                creep.say('🌙 等待资源重生!');
                break;
            default:
                // Job cause fatal-error
                creep.memory.job = this.jobList.None;
                delete creep.memory.target;
        }
    } else {
        // Job is valid
        creep.memory.job = this.jobList.None;
        delete creep.memory.target;
    }
    
};

IntentHarvester.run = function (bee){
    let creep = bee.creep;
    if(!creep.memory.job){
        // Find an job
        creep.memory.job = this.findJob(bee);
    } else {
        // Do the job
        switch (creep.memory.job) {
            case this.jobList.Transfer:
                this.transfer(bee);
                break;
            case this.jobList.Harvest:
                this.harvest(bee);
                break;
            default:
                creep.say('❌ 未知工作！');
                break;
        }
    }
};


module.exports.DefaultHarvester = DefaultHarvester;
module.exports.IntentHarvester = IntentHarvester;