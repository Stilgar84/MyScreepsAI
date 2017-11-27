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
	    if(!creep.memory.unload && creep.carry.energy >= creep.carryCapacity-20) {
	        creep.memory.unload = true;
	    }
	    
	    //console.log('Carry: ' + creep.memory.unload +" - " + creep.carry.energy);

	    if(creep.memory.unload) {
            var target = Game.getObjectById(creep.memory.tId);
            if(target==null) {
                // searching for target
                // creep.say("Targeting")

                var targets = creep.room.find(FIND_MY_CREEPS, {
                        filter: (c) => { return (c.memory.role == "upgrader") 
                            && (c.carry.energy < c.carryCapacity-20)
                            && utils.distanceApprox(creep,c)<5 }
                });
                if(targets.length > 0) {
                    target = targets[0] // take least full then nearest
                    var dist = target.carry.energy
                    for(i=1; i<targets.length;i++) {
                        var alt = targets[i]
                        const altD = alt.carry.energy
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
	        var targets = creep.room.find(FIND_FLAGS);
	        targets = targets.filter((o) => o.name=="LoadingFlag")
            if(targets.length) {
                creep.moveTo(targets[0]);
            }
	    }
	}
};