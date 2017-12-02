
var utils = require('utils');

var roleHarvester = {

    /** @param {Creep} creep **/
    run: function(creep) {
        
	    if(creep.memory.transfering && creep.carry.energy <= 0) {
            creep.memory.transfering = false;
            creep.memory.tId = null
            creep.say("-> harv")
	    }
	    if(!creep.memory.transfering && creep.carry.energy == creep.carryCapacity) {
	        creep.memory.transfering = true;
	    }

	    if(!creep.memory.transfering) {
            var sources = creep.room.find(FIND_SOURCES);
            var sourceid = 0 //creep.memory.source || 0;
            //creep.say(creep.name + " " + (creep.memory.source || 0))
            var err = creep.harvest(sources[sourceid])
            if(err == ERR_NOT_IN_RANGE) {
                creep.moveTo(sources[sourceid]);
            } else if(err == ERR_NOT_ENOUGH_RESOURCES) {
                if(creep.harvest(sources[1]) == ERR_NOT_IN_RANGE) {
                    creep.moveTo(sources[sourceid]);
                }
            }
        }
        else {
            var target = null //Game.getObjectById(creep.memory.tId);
            // should retarget from time to time too
            if(target==null) {
                // searching for target
                //creep.say("Targeting")

                var targets = creep.room.find(FIND_STRUCTURES, {
                        filter: (structure) => {
                            return (structure.structureType == STRUCTURE_EXTENSION || structure.structureType == STRUCTURE_SPAWN || structure.structureType == STRUCTURE_TOWER)
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