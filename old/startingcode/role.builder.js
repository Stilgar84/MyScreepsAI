
var roleHarvester = require('role.harvester');

var roleBuilder = {

    /** @param {Creep} creep **/
    run: function(creep) {

	    if(creep.memory.building && creep.carry.energy == 0) {
            creep.memory.building = false;
            creep.memory.tId = null
	    }
	    if(!creep.memory.building && creep.carry.energy == creep.carryCapacity) {
	        creep.memory.building = true;
	    }

	    if(creep.memory.building) {
            var target = Game.getObjectById(creep.memory.tId);
            if(target==null) {
                // look first for urgent repair
                // only needed if room has no tower to handle this
                // TODO, or are they rebuild auto??
                
                
    	        var targets = creep.room.find(FIND_CONSTRUCTION_SITES);
                if(targets.length) {
                    target = targets[0]
                }
                if(target) {
                    creep.memory.tId = target.id
                }
            }
            if(target) {
                const err = creep.build(target)
                if(err == ERR_NOT_IN_RANGE) {
                    creep.moveTo(target);
                } else if(err == ERR_INVALID_TARGET) {
                    creep.memory.tId = null
                }
            } else {
                // fallback on harvester logic if there is nothing to build
                roleHarvester.run(creep)
            }
	    }
	    else {
	        var sources = creep.room.find(FIND_SOURCES);
	        var srcId = 1
            if(creep.harvest(sources[srcId]) == ERR_NOT_IN_RANGE) {
                creep.moveTo(sources[srcId]);
            }
	    }
	}
};

module.exports = roleBuilder;