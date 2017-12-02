
var move2room2 = require('action.move2room2');

module.exports = {
    /** @param {Creep} creep **/
    run: function(creep) {
        if(move2room2.move(creep)) {
            targets = creep.room.find(FIND_HOSTILE_STRUCTURES)
            if(targets.length>0) {
                target = targets[0]
                err = creep.attack(target)
                if(err == ERR_NOT_IN_RANGE) {
                    creep.moveTo(target)
                }
            }
        }
	}
};