
var utils = require('utils');

var roleHarvester = {

    /** @param {Creep} creep **/
    run: function(creep) {
        
	    if(creep.memory.transfering && creep.carry.energy <= 10) {
            creep.memory.transfering = false;
            creep.memory.tId = null
            creep.say("-> harv")
	    }
	    if(!creep.memory.transfering && creep.carry.energy == creep.carryCapacity) {
	        creep.memory.transfering = true;
	    }

	    if(!creep.memory.transfering) {
            var sources = creep.room.find(FIND_SOURCES);
            var sourceid = 0 //(creep.memory.source || 0);
            //creep.say(creep.name + " " + (creep.memory.source || 0))
            if(creep.harvest(sources[sourceid]) == ERR_NOT_IN_RANGE) {
                creep.moveTo(sources[sourceid]);
            }
        }
        else {
            var target = Game.getObjectById(creep.memory.tId);
            // should retarget from time to time too
            if(target==null) {
                // searching for target
                //creep.say("Targeting")

                var targets = creep.room.find(FIND_STRUCTURES, {
                        filter: (structure) => {
                            return (structure.structureType == STRUCTURE_EXTENSION || structure.structureType == STRUCTURE_SPAWN)
                            &&                            structure.energy < structure.energyCapacity
                            ;
                        }
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
                } else {
                    var targets = creep.room.find(FIND_MY_CREEPS, {
                            filter: (c) => { return (c.memory.role == "carry") && !c.memory.unloading
                                && (c.carry.energy < c.carryCapacity)
                                && utils.distanceApprox(creep,c)<5 } 
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
                    } else {
                        var targets = creep.room.find(FIND_FLAGS, {
                                filter: (c) => c.name=="LoadingFlag"
                        });
                        if(targets.length > 0) {
                            creep.moveTo(targets[0]);
                        }
                    }
                }
                
                if(target) {
                    creep.memory.tId = target.id
                }
            }
            res = creep.transfer(target, RESOURCE_ENERGY)
            if(res == ERR_NOT_IN_RANGE) {
                // check target full here to avoid moves
                if( (target.carry && (target.carry.energy>=target.carryCapacity-20 || target.memory.unloading))
                ||  (target.energyCapacity && target.energy==target.energyCapacity) ) {
                    //creep.say("Targetfull")
                    creep.memory.tId = null
                } else {
                    creep.moveTo(target);
                }
            } else if(res == ERR_FULL) {
                //creep.say("Targetfull")
                creep.memory.tId = null
            }
        }
	}
};

module.exports = roleHarvester;