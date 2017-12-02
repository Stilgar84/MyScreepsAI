/*
 * Module code goes here. Use 'module.exports' to export things:
 * module.exports.thing = 'a thing';
 *
 * You can import it from another modules like this:
 * var mod = require('utils');
 * mod.thing == 'a thing'; // true
 */

module.exports = {
    distanceApprox: function(o1, o2) {
        return Math.abs(o1.pos.x-o2.pos.x)+Math.abs(o1.pos.y-o2.pos.y)
    },

    moveToFlag: function(creep, flagName) {
        var targets = creep.room.find(FIND_FLAGS);
        targets = targets.filter((o) => o.name==flagName)
        if(targets.length>0) {
            if(creep.pos.isEqualTo(targets[0].pos)) {
                return true
            } else {
                creep.moveTo(targets[0]);
                return false
            }
        }
    }
};