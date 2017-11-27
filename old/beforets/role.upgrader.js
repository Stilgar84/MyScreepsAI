var roleUpgrader = {

    /** @param {Creep} creep **/
    run2: function(creep) {
        state = creep.memory.state || 0
	    if(state == 0) {
	        if(creep.carry.energy==0) {
                state = 1
            }
            if(creep.upgradeController(creep.room.controller) == ERR_NOT_IN_RANGE) {
                creep.moveTo(creep.room.controller);
            }
        }
        else {
            if(creep.carry.energy>=48) {
                state = 0
            }
            var sources = creep.room.find(FIND_SOURCES);
            if(creep.harvest(sources[1]) == ERR_NOT_IN_RANGE) {
                creep.moveTo(sources[1]);
            }
        }
        if(state != creep.memory.state)
        {
            creep.say(creep.memory.state + " -> " + state)
        }
        creep.memory.state = state
	},

    run: function(creep) {
        //state = creep.memory.state || 0
        if(creep.carry.energy>0) {
            if(creep.upgradeController(creep.room.controller) == ERR_NOT_IN_RANGE) {
                creep.moveTo(creep.room.controller);
            }
        }
        else {
            var sources = creep.room.find(FIND_FLAGS, {
                filter: (c) => c.name=="Reload"
            });
            if(sources.length==0) {
                creep.say("NoFlag")
            } else {
                creep.moveTo(sources[0]);
            }
        }
	}

    
};

module.exports = roleUpgrader;