const _ = require('lodash');
const AIInterface = require('interface.ai');
const InterfaceCivilian = require('interface.civilian');
const MK = require('magic.key');

class AIHarvesterInterface extends AIInterface{
    constructor(){
        super();
        this.jobList = {
            None : undefined,
            Transfer : 'Transfer',
            Harvest : 'Harvest'
        };

        this.visualizePathStyle = {
            stroke: '#DAA520'
        };

        this.AIName = "AIHarvesterInterface";
    }

    /**
     * Abstract
     * @param bee
     */
    transfer(bee){
        console.log('Abstract Method:transfer() in AIHarvesterInterface.class');
    }

    /**
     * Default harvest method for energy-harvester
     * @param bee
     */
    harvest(bee){
        let creep = bee.creep;
        let target = Game.getObjectById(creep.memory.target);
        if(target){
            let actionStatus = creep.harvest(target);
            switch (actionStatus) {
                case ERR_NOT_IN_RANGE:
                    creep.moveTo(target,{ visualizePathStyle:this.visualizePathStyle });
                    creep.say('💰 开采能源!');
                    break;
                case OK:
                    if(creep.carry.energy === creep.carryCapacity){// Job is done
                        delete creep.memory.target;
                        //creep.memory.job = this.jobList.None;
                        this.findJob(bee);
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
            //console.log(`actionStatus:${actionStatus}`);
        } else {
            // Job is valid
            delete creep.memory.target;
            //creep.memory.job = this.jobList.None;
            this.findJob(bee);
        }
    }

    /**
     * Abstract
     * @param bee
     */
    findJob(bee){
        console.log('Abstract Method:findJob() in AIHarvesterInterface.class');
    }

    run(bee){

        let creep = bee.creep;
        //console.log(Game.time, JSON.stringify(creep.memory.job));
        if(!creep.memory.job){
            // Find an job
            this.findJob(bee);
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
    }
}

const DefaultProducer = InterfaceCivilian.DefaultProducer;

/**
 * DefaultHarvester will harvest energy
 * and transfer to structure (spawn > extension > container > storage)
 * without range-limited.
 * Will drop all remain resources if target-container is full
 *
 * @type {AIHarvesterInterface}
 */
const DefaultHarvester = new AIHarvesterInterface();
DefaultHarvester.AIName = "DefaultHarvester";

DefaultHarvester.findJob = function (bee) {
    let creep = bee.creep;
    creep.say("🕗 找工作中");

    if(creep.carry.energy >= creep.carryCapacity){
        let targetList = DefaultProducer.findExtensionOrSpawn(bee, false); // Extension first
        if(targetList.length>0){
            creep.memory.target = targetList[0].id;
            creep.memory.job = this.jobList.Transfer;
            return;
        }

        targetList = DefaultProducer.findContainerOrStorage(bee, false); // Container first
        if(targetList.length>0){
            creep.memory.target = targetList[0].id;
            creep.memory.job = this.jobList.Transfer;
            return;
        }

        creep.say("❌ 等待存储点...");

    } else {
        // let target = DefaultProducer.findSource(bee); // @see interface.civilian
        // hot-fix for now [begin]
        let sources = bee.myComb.resources.sources;
        sources = _.map(sources , s => Game.getObjectById(s.id)); // hot-fix:refresh
        sources = _.sortByOrder(sources,['energy'], ['desc']);
        // hot-fix [end]
        let target = sources[0];
        if(target){
            creep.memory.target = target.id;
            creep.memory.job = this.jobList.Harvest;
        } else {
            creep.say('❌ 无能源点!');
        }
    }
};

DefaultHarvester.transfer = function (bee) {
    let creep = bee.creep;
    let target = Game.getObjectById(creep.memory.target);
    let notFull = true;

    if(!target){
        // Job is valid
        creep.memory.job = this.jobList.None;
        delete creep.memory.target;
        return;
    }

    if(target.structureType === STRUCTURE_SPAWN || target.structureType === STRUCTURE_EXTENSION){
        notFull = target.energy < target.energyCapacity;
    } else {
        notFull = target.store[RESOURCE_ENERGY] < target.storeCapacity;
    }
    if(notFull){
        let actionStatus = creep.transfer(target, RESOURCE_ENERGY);
        switch (actionStatus) {
            case ERR_NOT_IN_RANGE:
                creep.moveTo(target,{ visualizePathStyle:this.visualizePathStyle });
                creep.say('🚒 运送能源!');
                break;
            case OK:
                break;
            case ERR_FULL: // Just drop resources here
                creep.drop(RESOURCE_ENERGY); // Waiting Transfer to pick these
                break;
            default:
                // Job cause fatal-error
                creep.memory.job = this.jobList.None;
                delete creep.memory.target;
        }
        if(creep.carry.energy === 0){ // Job is done
            creep.memory.job = this.jobList.None;
            delete creep.memory.target;
        }
        //console.log('HarvesterLog',Game.time, creep.name,`${creep.pos.x},${creep.pos.y}` ,JSON.stringify(creep.memory), actionStatus, target.structureType);
    } else {
        // Job is valid
        creep.memory.job = this.jobList.None;
        delete creep.memory.target;
    }
};


/**
 * IntentHarvester.class will focus on harvest
 * When carry is full, he will drop all of the resources
 * if there are no container nearby
 *
 * @type {AIHarvesterInterface}
 */
const IntentHarvester = new AIHarvesterInterface();
IntentHarvester.AIName = "IntentHarvester";

IntentHarvester.findJob = function(bee){
    let creep = bee.creep;
    creep.say("🕗 找工作中");
    if(creep.carry.energy === creep.carryCapacity){
        // In range-1, no need assign a target, it's a waste of CPU
        creep.memory.job = this.jobList.Transfer;
    } else {

        if(creep.carry.energy > 0){ // Any way, in this tick just drop all the resources
            creep.drop(RESOURCE_ENERGY);
            creep.say("🌝 丢弃资源！");
        }

        let target = DefaultProducer.findSource(bee); // @see interface.civilian
        if(target){
            creep.memory.target = target.id;
            creep.memory.job = this.jobList.Harvest;
        } else {
            creep.say('❌ 无能源点!');
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
        let actionStatus = creep.transfer(target, RESOURCE_ENERGY); // in range 1
        switch (actionStatus) {
            case ERR_FULL:
                creep.drop(RESOURCE_ENERGY);
                creep.say("🌝 丢弃资源！");
                break;
            default:
                creep.say("⛽ 暂存资源！");

        }
    }
    this.findJob(bee);
    // creep.memory.job = this.jobList.None; // Job is done
};

/**
 * AlwaysHarvester.class will focus on harvest
 * and drop resources immediately
 * He'll try to find container around sources then step up,
 * so the dropped-resources can be auto-collected by container
 * Never do transfer-job!
 *
 * @type {AIHarvesterInterface}
 */
const AlwaysHarvester = new AIHarvesterInterface();
AlwaysHarvester.AIName = "AlwaysHarvester";

AlwaysHarvester.findJob = function(bee){
    let creep = bee.creep;
    creep.say("🕗 找工作中");
    if(creep.carry.energy === 0){
        // let target = DefaultProducer.findSource(bee); // @see interface.civilian

        // 临时改用下面这个方法 : 找到一个周围没有采集者的能量点
        let target = DefaultProducer.findSourcesWithoutHarvester(bee, true)[0];

        if(target){
            let containers = target.room.lookForAtArea(LOOK_STRUCTURES,
                target.pos.y-1,target.pos.x-1,target.pos.y+1,target.pos.x+1, true);
            containers = _.filter(containers,  c => c.structure && c.structure.structureType === STRUCTURE_CONTAINER);
            if(containers.length>0){ // Note: containers-array like , {type:"xxx", structure:{...}}
                creep.memory.containerPos = containers[0].structure.id;
            }
            creep.memory.target = target.id;
            creep.memory.job = this.jobList.Harvest;
        } else {
            creep.say('❌ 无能源点!');
        }
    } else {
        creep.say('❌ 无事可做!');
    }
};

AlwaysHarvester.harvest = function(bee){
    let creep = bee.creep;
    let target = Game.getObjectById(creep.memory.target);

    let containerPos = undefined;
    if(creep.memory.containerPos){ // try to find an container
        containerPos = Game.getObjectById(creep.memory.containerPos);
    }

    if(target){
        let actionStatus = creep.harvest(target);
        switch (actionStatus) {
            case ERR_NOT_IN_RANGE:
                creep.moveTo(containerPos?containerPos:target,{ visualizePathStyle:this.visualizePathStyle });
                creep.say('💰 开采能源!');
                break;
            case ERR_TIRED:
            case ERR_NOT_ENOUGH_RESOURCES:
                creep.say('🌙 等待资源重生!');
                break;
            case OK:
                break; // Just keep harvesting
            default:
                // Job cause fatal-error
                creep.memory.job = this.jobList.None;
                delete creep.memory.target;
                if(creep.memory.containerPos) delete creep.memory.containerPos;
        }
        //console.log(`actionStatus:${actionStatus}`);
    } else {
        // Job is valid
        creep.memory.job = this.jobList.None;
        delete creep.memory.target;
        if(creep.memory.containerPos) delete creep.memory.containerPos;
    }
};

const MineralHarvester = new AIHarvesterInterface();
MineralHarvester.AIName = "MineralHarvester";
MineralHarvester.findJob = function(bee){
    let creep = bee.creep;
    let mineral = bee.myComb.resources.mineral;
    creep.say("🕗 找工作中");
    if(mineral && !creep.carry[mineral.mineralType]){
        creep.memory.target = mineral.id;
        creep.memory.job = this.jobList.Harvest;
    } else {
        // store resource
        let terminal = creep.room.terminal;
        creep.memory.mineralType = mineral.mineralType;
        if(terminal){
            creep.memory.target = terminal.id;
            creep.memory.job = this.jobList.Transfer;
            return;
        }

        let storage = creep.room.storage;
        if(storage){
            creep.memory.target = storage.id;
            creep.memory.job = this.jobList.Transfer;
            return;
        }

        creep.say('❌ 无储存点!');
    }
};

MineralHarvester.harvest = function(bee){
    let creep = bee.creep;
    let target = Game.getObjectById(creep.memory.target);

    if(target){
        let actionStatus = creep.harvest(target);
        switch (actionStatus) {
            case ERR_NOT_IN_RANGE:
                creep.moveTo(target,{ visualizePathStyle:this.visualizePathStyle });
                creep.say('⛏️ 开采矿物!');
                break;
            case ERR_NOT_FOUND:
                creep.say('❌️ 需要矿物点!');
                break;
            case ERR_TIRED:
            case ERR_NOT_ENOUGH_RESOURCES:
                creep.say('🌙 等待资源重生!');
                break;
            case OK:
                if(creep.carry[target.mineralType] === creep.carryCapacity){// Job is done
                    delete creep.memory.target;
                    //creep.memory.job = this.jobList.None;
                    this.findJob(bee);
                }
                break;
            default:
                // Job cause fatal-error
                creep.memory.job = this.jobList.None;
                delete creep.memory.target;
                if(creep.memory.containerPos) delete creep.memory.containerPos;
        }
        //console.log(`actionStatus:${actionStatus}`);
    } else {
        // Job is valid
        creep.memory.job = this.jobList.None;
        delete creep.memory.target;
        if(creep.memory.containerPos) delete creep.memory.containerPos;
    }
};

MineralHarvester.transfer = function(bee){
    let creep = bee.creep;
    let target = Game.getObjectById(creep.memory.target);
    let actionStatus = creep.transfer(target, creep.memory.mineralType);
    switch (actionStatus) {
        case ERR_NOT_IN_RANGE:
            creep.moveTo(target,{ visualizePathStyle:this.visualizePathStyle });
            creep.say('🚒 运送矿物!');
            break;
        case OK:
            break;
        case ERR_FULL: // Just drop resources here
            creep.drop(RESOURCE_ENERGY); // Waiting Transfer to pick these
            break;
        default:
            // Job cause fatal-error
            creep.memory.job = this.jobList.None;
            delete creep.memory.target;
    }
    if(!creep.carry[creep.memory.mineralType]){ // Job is done
        creep.memory.job = this.jobList.None;
        delete creep.memory.target;
    }
};

module.exports.DefaultHarvester = DefaultHarvester;
module.exports.IntentHarvester = IntentHarvester;
module.exports.AlwaysHarvester = AlwaysHarvester;
module.exports.MineralHarvester = MineralHarvester;