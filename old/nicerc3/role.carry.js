/*
 * Module code goes here. Use 'module.exports' to export things:
 * module.exports.thing = 'a thing';
 *
 * You can import it from another modules like this:
 * var mod = require('role.carry');
 * mod.thing == 'a thing'; // true
 */
 
 var utils = require('utils');

module.exports = {
    /** @param {Creep} creep **/
    run: function(creep) {

	    if(creep.memory.unload && creep.carry.energy == 0) {
            creep.memory.unload = false;
            creep.memory.tId = null;
	    }
	    if(!creep.memory.unload && creep.carry.energy == creep.carryCapacity) {
	        creep.memory.unload = true;
	    }
	    
	    //console.log('Carry: ' + creep.memory.unload +" - " + creep.carry.energy);

	    if(creep.memory.unload) {
	        // kill perf, and make carry change their mind all the time
            var target = null//Game.getObjectById(creep.memory.tId);
            if(target==null || (target.carry && target.carry.energy == target.carryCapacity)) {
                // searching for target
                // creep.say("Targeting")

                
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
                    targets = creep.room.find(FIND_MY_CREEPS, {
                            filter: (c) => { return (c.memory.role == "upgrader" || c.memory.role == "builder") 
                                && (c.carry.energy < c.carryCapacity-20)
                                /*&& utils.distanceApprox(creep,c)<10*/ }
                    });
                    if(targets.length > 0) {
                        target = targets[0] // take least full then nearest
                        var dist = target.carry.energy + utils.distanceApprox(creep,target)*15
                        for(i=1; i<targets.length;i++) {
                            var alt = targets[i]
                            const altD = alt.carry.energy + utils.distanceApprox(creep,alt)*15
                            if(altD<dist) {
                                dist = altD
                                target = alt
                            }
                        }
                    } else {
                        var targets = creep.room.find(FIND_FLAGS, {
                                filter: (c) => c.name=="UpgradeFlag"
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
                creep.moveTo(target);
            } /*else if(res == ERR_FULL) {
                creep.say("Targetfull");
                creep.memory.tId = null;
            }*/
            else {
                creep.memory.tId = null; // only keep target for move
            }
	    }
	    else {
	        var flagName = creep.memory.flagName || "LoadingFlag";
	        creep.memory.flagName = flagName
	        var targets = creep.room.find(FIND_FLAGS);
	        targets = targets.filter((o) => o.name==flagName)
            if(targets.length) {
                if(creep.pos.isEqualTo(targets[0].pos)) {
                    var targets = creep.pos.findInRange(FIND_STRUCTURES, 1)
                    targets = targets.filter((structure) => {
                        return (structure.structureType == STRUCTURE_CONTAINER)
                        &&                            structure.store.energy > 0
                        ;
                    });
                    if(targets.length > 0) {
                        target = targets[0]
                        creep.withdraw(target, RESOURCE_ENERGY)
                    }
                } else {
                    creep.moveTo(targets[0]);
                }
            }
	    }
	}
};