
var roleHarvester = require('role.harvester');

var roleBuilderHarvester = {

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
            var action = creep.memory.action;
            if(target==null) {
                // look first for urgent repair
                // only needed if room has no tower to handle this
                // ! roads and collector are neutral
                var targets = creep.room.find(FIND_STRUCTURES, {
                    filter: (s) => s.hits<(s.hitsMax*0.5) && (s.my || s.owner===undefined)
                });
                //console.log("repair: " + targets)
                if(targets.length) {
                    target = targets[0] // better selection? + filter more
                    action = "repair"
                } else {
        	        targets = creep.room.find(FIND_MY_CONSTRUCTION_SITES);
                    if(targets.length) {
                        target = targets[0] // select the oldest construction site
                        action = "build"
                    }
                }
                
                if(target) {
                    creep.memory.tId = target.id
                    creep.memory.action = action
                }
            }
            if(target) {
                var err = null;
                if(action=="repair") {
                    if(target.hits==target.hitsMax) {
                        creep.memory.tId = null
                    }
                    err = creep.repair(target)
                } else {
                    err = creep.build(target)
                }
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

module.exports = roleBuilderHarvester;