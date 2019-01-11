// every object in this file will be named as '_MagicKey*'
const _MagicKeyRole = {
    Harvester : {
        value : 'Harvester', // Keep be the same as Object.Key for reflecting
        shortcut : 'H' // The short name of this kind of Creep.class
        // description : 'Harvester will do the job of Harvest-Energy/Resource
    },

    Transfer : {
        value : 'Transfer',
        shortcut : 'T'
        // description : 'Transfer will do the job of Transfer-Energy/Resource or Pull-Creep
    },

    Builder : {
        value : 'Builder',
        shortcut : 'B'
        // description : 'Builder will do the job of Build-Structure'
    },

    Upgrader : {
        value : 'Upgrader',
        shortcut : 'U'
        // description : 'Upgrader will do the job of Upgrader-Controller'
    },

    Soldier : {
        value : 'Soldier',
        shortcut : 'S'
        // description : 'Soldier will do the job of Patrol or Fight, etc.'
    },

    Fixer : {
        value : 'Fixer',
        shortcut : 'F'
        // description : 'Fixer will do the job of Fix-Structure or Heal'
    },

    Miner : {
        value : 'Miner',
        shortcut : 'M'
        // description : 'Miner will do the job of Miner'
    }
};

const _MagicKeyProfession = {
    Default : 'Default', // Every Creep has a default type of AI
    Intent : 'Intent'
};

module.exports.ROLE = _MagicKeyRole;
module.exports.PRO = _MagicKeyProfession;