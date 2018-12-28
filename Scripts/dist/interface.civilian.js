const _ =require('lodash');

class ConsumerInterface{
    /**
     * Behavior : Find Storage Storage
     * @param{ClassBee} bee : the bee carry out this action
     */
    findEnergyStorage(bee){

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
            filter: s => s.energy < s.energyCapacity
                && (s.structureType === STRUCTURE_EXTENSION  || s.structureType === STRUCTURE_SPAWN)
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





module.exports.ConsumerInterface = ConsumerInterface;
module.exports.ProducerInterface = ProducerInterface;
module.exports.DefaultConsumer = DefaultConsumer;
module.exports.DefaultProducer = DefaultProducer;