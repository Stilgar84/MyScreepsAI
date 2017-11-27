
var roleUpgrader = require('role.upgrader');

const wallTargetHp = 20000

var roleBuilder = {

    /** @param {Creep} creep **/
    run: function(creep) {
        var target = Game.getObjectById(creep.memory.tId);
        var action = creep.memory.action;
        if(target==null) {
            // look first for urgent repair
            // only needed if room has no tower to handle this
            // ! roads and collector are neutral
            var targets = creep.room.find(FIND_STRUCTURES, {
                filter: (s) => ((s.structureType==STRUCTURE_WALL && s.hits<0.7*wallTargetHp)
                || (s.structureType!=STRUCTURE_WALL && s.hits<(s.hitsMax*0.5))) && (s.my || s.owner===undefined)
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
                if((target.structureType==STRUCTURE_WALL && target.hits>=wallTargetHp)
                || (target.structureType!=STRUCTURE_WALL && target.hits>=target.hitsMax)) {
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
            // fallback on upgrader logic if there is nothing to build
            roleUpgrader.run(creep)
        }
	}
};

module.exports = roleBuilder;