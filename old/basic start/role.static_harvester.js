
var utils = require('utils');

// crazy inneficient!
var roleStaticHarvester = {

    /** @param {Creep} creep **/
    run: function(creep) {
        var sources = creep.room.find(FIND_SOURCES);
        var sourceid = creep.memory.source || 0;
        if(creep.harvest(sources[sourceid]) == ERR_NOT_IN_RANGE) {
            creep.moveTo(sources[sourceid]);
        }

        var target = Game.getObjectById(creep.memory.tId);
        // should retarget from time to time too
        if(target==null) {
            // searching for target
            //creep.say("Targeting")


           var targets = creep.pos.findInRange(FIND_STRUCTURES, 1)
           targets = targets.filter((structure) => {
                        return (structure.structureType == STRUCTURE_CONTAINER)
                        &&                            structure.store.energy < structure.storeCapacity
                        ;
                    });
            //console.log(targets)
            if(targets.length > 0) {
                target = targets[0]
            } else {
                var targets = creep.pos.findInRange(FIND_MY_CREEPS, 1)
                targets = targets.filter((c) => { return (c.memory.role == "carry") 
                            && (c.carry.energy < c.carryCapacity)
                });
                if(targets.length > 0) {
                    target = targets[0]
                    // simple approximate find nearest one!
                    var dist = Math.abs(target.pos.x-creep.pos.x)+Math.abs(target.pos.y-creep.pos.y)
                    for(i=1; i<targets.length;i++) {
                        var alt = targets[i]
                        const altD = Math.abs(creep.pos.x-alt.pos.x)+Math.abs(creep.pos.y-alt.pos.y)
                        if(altD<dist) {
                            dist = altD
                            target = alt
                        }
                    }
                }
            }
            
            if(target) {
                creep.memory.tId = target.id
            }
        }
        
        // can do both transfert and harvest
        res = creep.transfer(target, RESOURCE_ENERGY)
        if(res != OK) {
            creep.memory.tId = null
        }
	}
};

module.exports = roleStaticHarvester;