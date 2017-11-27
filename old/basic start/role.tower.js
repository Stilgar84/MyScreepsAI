/*
 * Module code goes here. Use 'module.exports' to export things:
 * module.exports.thing = 'a thing';
 *
 * You can import it from another modules like this:
 * var mod = require('role.tower');
 * mod.thing == 'a thing'; // true
 */
 
const wallTargetHp = 24000

module.exports = {
    run: function(tower) {
        var target = null
        
        var targets = tower.room.find(FIND_HOSTILE_CREEPS);
        if(targets.length > 0) {
            target = targets[0]
            tower.attack(target)
        } else {
            targets = tower.room.find(FIND_STRUCTURES, {
                filter: (s) => ((s.structureType==STRUCTURE_WALL && s.hits<0.7*wallTargetHp)
                || (s.structureType!=STRUCTURE_WALL && s.hits<(s.hitsMax*0.75))) && (s.my || s.owner===undefined)
            });
            //console.log("repair: " + targets)
            if(targets.length) {
                target = targets[0] // better selection? + filter more
            }
        
            if(target) {
                var err = null;
                err = tower.repair(target)
                if(err != OK) {
                    console.log("Tower err: " + err)
                }
            }
        }
    }
};