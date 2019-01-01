const _ =require('lodash');

class ConsumerInterface{
    /**
     * Behavior : Find Closest Energy Storage
     * @param{ClassBee} bee : the bee carry out this action
     */
    findClosestEnergyStorage(bee){

    }

    findEnergyStorageOrContainer(bee, reverse=false){

    }


    /**
     * Behavior : Find Mineral Storage
     * @param{ClassBee} bee : the bee carry out this action
     */
    findMineralStorage(bee){

    }

}

/**
 * ProducerInterface provide the interface-method for
 * A bee harvest/store Energy/Mineral
 */
class ProducerInterface{
    /**
     * Behavior : Harvest Energy
     * @param{ClassBee} bee : the bee carry out this action
     */
    harvestEnergy(bee){

    }

    /**
     * Behavior : Harvest Mineral
     * @param{ClassBee} bee : the bee carry out this action
     */
    harvestMineral(bee){

    }

    findSource(bee){

    }

    /**
     * Behavior : Find Container Or Storage, Container will be front
     * @param{ClassBee} bee : The bee carry out this action
     * @param{boolean} reverse=false : Storage will be front
     * @return{array} : result of this method
     */
    findContainerOrStorage(bee, reverse=false){

    }

    /**
     * Behavior : Find Extension Or Spawn, Extension will be front
     * @param{ClassBee} bee : The bee carry out this action
     * @param{boolean} reverse=false : Spawn will be front
     * @return{array} : result of this method
     */
    findExtensionOrSpawn(bee, reverse=false){

    }
    /**
     * Behavior : Store Energy and Mineral
     * @param{ClassBee} bee : the bee carry out this action
     * @param{string} resourceType : type of resources
     */
    store(bee, resourceType){

    }
}

/**
 * There are two default implement
 */
const DefaultConsumer = new ConsumerInterface();
const DefaultProducer = new ProducerInterface();

DefaultProducer.findSource = function(bee){
    // Find an resources, order by amount or sort by L1
    // So, there will be two situation:
    // 1.Bee is newborn, he will find the Energy-Source with less harvester around
    // 2.Keep stay in position, until the Energy-Source nearby to be refreshed
    let creep = bee.creep;
    let sources = bee.myComb.resources.sources;
    if(creep.pos.findInRange(FIND_MY_SPAWNS,1).length >0){
        sources = _.sortByOrder(sources,['energy'], ['desc']); // lodash 3.10 use sortByOrder() instead of orderBy()

    } else {
        sources = _.sortBy(sources, r =>
            Math.abs(creep.pos.x - r.pos.x) + Math.abs(creep.pos.y - r.pos.y)
        );
    }
    return sources[0];
};

DefaultProducer.findContainerOrStorage = function(bee, reverse=false){
    let resultStoreList = bee.myComb.room.find(FIND_STRUCTURES,
        {
            filter: s => s.energy < s.energyCapacity
                && (s.structureType === STRUCTURE_CONTAINER  || s.structureType === STRUCTURE_STORAGE)
                && s.store[RESOURCE_ENERGY] < s.storeCapacity
        }
    );
    if(reverse){
        resultStoreList = _.union(
            _.filter(resultStoreList, s => s.structureType === STRUCTURE_CONTAINER),
            _.filter(resultStoreList, s => s.structureType === STRUCTURE_STORAGE)
        );
    } else {
        resultStoreList = _.union(
            _.filter(resultStoreList, s => s.structureType === STRUCTURE_STORAGE),
            _.filter(resultStoreList, s => s.structureType === STRUCTURE_CONTAINER)
        );
    }
    return resultStoreList;
};

DefaultProducer.findExtensionOrSpawn = function(bee, reverse=false){
    let resultStoreList = bee.myComb.room.find(FIND_STRUCTURES,
        {
            filter: s => (s.structureType === STRUCTURE_EXTENSION  || s.structureType === STRUCTURE_SPAWN)
                && s.energy < s.energyCapacity
        }
    );
    if(reverse){
        resultStoreList = _.union(
            _.filter(resultStoreList, s => s.structureType === STRUCTURE_SPAWN),
            _.filter(resultStoreList, s => s.structureType === STRUCTURE_EXTENSION)
        );
    } else {
        resultStoreList = _.union(
            _.filter(resultStoreList, s => s.structureType === STRUCTURE_EXTENSION),
            _.filter(resultStoreList, s => s.structureType === STRUCTURE_SPAWN)
        );
    }


    return resultStoreList;
};

DefaultConsumer.findClosestEnergyStorage = function(bee){
    let creep = bee.creep;
    let target = creep.pos.findClosestByRange(FIND_STRUCTURES, {
        filter : s => (s.structureType === STRUCTURE_CONTAINER
            || s.structureType === STRUCTURE_STORAGE ) && s.store[RESOURCE_ENERGY] > 0
    });
    if(target){
        return target;
    }

    target = creep.pos.findClosestByRange(FIND_STRUCTURES, {
        filter : s => (s.structureType === STRUCTURE_EXTENSION
            || s.structureType === STRUCTURE_SPAWN ) && s.energy > 0
    });

    if(target){
        return target;
    }

};

DefaultConsumer.findEnergyStorageOrContainer = function(bee, reverse=false){
    let creep = bee.creep;

    let targetList = creep.room.find(FIND_STRUCTURES, {
        filter : s => s.structureType === STRUCTURE_CONTAINER && s.store[RESOURCE_ENERGY] > 0
    });

    if(creep.room.storage && creep.room.storage.store[RESOURCE_ENERGY]>0){
        if(reverse){
            targetList.push(creep.room.storage);
        } else {
            targetList.unshift(creep.room.storage);
        }
    }

    return targetList;
};


module.exports.ConsumerInterface = ConsumerInterface;
module.exports.ProducerInterface = ProducerInterface;
module.exports.DefaultConsumer = DefaultConsumer;
module.exports.DefaultProducer = DefaultProducer;

