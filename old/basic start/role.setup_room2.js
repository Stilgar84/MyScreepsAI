
var move2room2 = require('action.move2room2');

module.exports = {
    /** @param {Creep} creep **/
    run: function(creep) {
        if(!move2room2.move(creep)) {
            return
        }

	    if(creep.memory.building && creep.carry.energy == 0) {
            creep.memory.building = false;
            creep.memory.tId = null
	    }
	    if(!creep.memory.building && creep.carry.energy == creep.carryCapacity) {
	        creep.memory.building = true;
	    }

	    if(creep.memory.building) {
            var target = null //Game.getObjectById(creep.memory.tId);
            var action = creep.memory.action;
            if(target==null) {
                // look first for urgent repair
                // only needed if room has no tower to handle this
                // ! roads and collector are neutral
                var targets = creep.room.find(FIND_STRUCTURES, {
                    filter: (s) => s.structureType==STRUCTURE_WALL && s.hits<100
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
                if(creep.upgradeController(creep.room.controller) == ERR_NOT_IN_RANGE) {
                    creep.moveTo(creep.room.controller);
                }
            }
	    }
	    else {
	        var sources = creep.room.find(FIND_SOURCES);
	        var srcId = 0
            if(creep.harvest(sources[srcId]) == ERR_NOT_IN_RANGE) {
                creep.moveTo(sources[srcId]);
            }
	    }
	}
};