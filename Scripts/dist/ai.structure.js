const _ = require('lodash');
const AIInterface = require('interface.ai');

class AIStructureInterface extends  AIInterface{
    constructor(){
        super();
        this.jobList = {
            None : undefined,
            Heal : 'Heal',
            Repair : 'Repair',
            Attack: 'Attack',
            Transfer : 'Transfer'
        };



        this.AIName = "AIStructureInterface";
    }

    heal(){
        console.log('Abstract Method:heal() in AIStructureInterface.class');
    }

    repair(){
        console.log('Abstract Method:repair() in AIStructureInterface.class');
    }

    attack(){
        console.log('Abstract Method:attack() in AIStructureInterface.class');
    }

    transfer(){
        console.log('Abstract Method:transfer() in AIStructureInterface.class');
    }

    findJob(beeStructure) {
        console.log('Abstract Method:findJob() in AIStructureInterface.class');
    }

    run(beeStructure) {
        //console.log(Game.time, beeStructure.structureID, this.AIName, JSON.stringify(beeStructure.memory));
        if(!beeStructure.memory.job){
            // Find an job
            this.findJob(beeStructure);
        } else {
            // Do the job
            switch (beeStructure.memory.job) {
                case this.jobList.Heal:
                    this.heal(beeStructure);
                    break;
                case this.jobList.Repair:
                    this.repair(beeStructure);
                    break;
                case this.jobList.Attack:
                    this.attack(beeStructure);
                    break;
                case this.jobList.Transfer:
                    this.transfer(beeStructure);
                    break;
                default:
                    console.log(`❌ [建筑物${beeStructure.structureID}]:未知工作！`);
                    break;
            }
        }
    }
}

const DefaultTower = new AIStructureInterface();
DefaultTower.AIName = "DefaultTower";

DefaultTower.findJob = function(beeStructure){
    let structure = beeStructure.structure;

    // Kill healer first
    let hostileHealers = structure.room.find(FIND_HOSTILE_CREEPS,{
        filter: c => c.getActiveBodyparts(HEAL) > 0
    });
    if(hostileHealers.length>0) {
        // Find biggest healers
        hostileHealers = _.sortByOrder(hostileHealers, c => c.getActiveBodyparts(HEAL), ['desc']);
        beeStructure.memory.job = this.jobList.Attack;
        beeStructure.memory.target = hostileHealers[0].id;
        return;
    }
    // Then kill other hostiles
    let closestHostile = structure.pos.findClosestByRange(FIND_HOSTILE_CREEPS);
    if(closestHostile) {
        beeStructure.memory.job = this.jobList.Attack;
        beeStructure.memory.target = closestHostile.id;
        return;
    }

    // If no enemy, try repair road
    let roadsToRepair = structure.room.find(FIND_STRUCTURES, {
        filter: s => s.structureType === STRUCTURE_ROAD && s.hits < s.hitsMax
    });

    if(roadsToRepair.length > 0) {
        beeStructure.memory.job = this.jobList.Repair;
        beeStructure.memory.target = roadsToRepair[0].id;
        return;
    }

    let creepNotHealth = structure.pos.findClosestByRange(FIND_CREEPS, {
        filter: c => c.hits < c.hitsMax
    });
    if(creepNotHealth) {
        beeStructure.memory.job = this.jobList.Heal;
        beeStructure.memory.target = creepNotHealth.id;
        return;
    }

    beeStructure.memory.job = this.jobList.None;
};

DefaultTower.repair = function(beeStructure){
    let structure = beeStructure.structure;
    let target = Game.getObjectById(beeStructure.memory.target);
    if(target && target.hits < target.hitsMax){
        let actionStatus = structure.repair(target);
        switch (actionStatus) {
            case OK:
                if(target.hits >= target.hitsMax){
                    delete beeStructure.memory.target;
                    this.findJob(beeStructure)
                }
                break;
            case ERR_NOT_ENOUGH_ENERGY:
            default:
                delete beeStructure.memory.target;
                this.findJob(beeStructure);
        }
    } else {
        delete beeStructure.memory.target;
        this.findJob(beeStructure);
    }
};

DefaultTower.attack = function(beeStructure){
    let structure = beeStructure.structure;
    let target = Game.getObjectById(beeStructure.memory.target);
    if(target && target.hits > 0){
        let actionStatus = structure.attack(target);
        switch (actionStatus) {
            case OK:
                if(target.hits <=0){
                    delete beeStructure.memory.target;
                    this.findJob(beeStructure)
                }
                break;
            case ERR_NOT_ENOUGH_ENERGY:
            default:
                delete beeStructure.memory.target;
                this.findJob(beeStructure);
        }
    } else {
        delete beeStructure.memory.target;
        this.findJob(beeStructure);
    }
};

DefaultTower.heal = function(beeStructure){
    let structure = beeStructure.structure;
    let target = Game.getObjectById(beeStructure.memory.target);
    if(target && target.hits < target.hitsMax){
        let actionStatus = structure.heal(target);
        switch (actionStatus) {
            case OK:
                if(target.hits >= target.hitsMax){
                    delete beeStructure.memory.target;
                    this.findJob(beeStructure)
                }
                break;
            case ERR_NOT_ENOUGH_ENERGY:
            default:
                delete beeStructure.memory.target;
                this.findJob(beeStructure);
        }
    } else {
        delete beeStructure.memory.target;
        this.findJob(beeStructure);
    }
};

module.exports.DefaultTower = DefaultTower;