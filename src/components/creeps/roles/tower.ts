/*
 * Module code goes here. Use 'module.exports' to export things:
 * module.exports.thing = 'a thing';
 *
 * You can import it from another modules like this:
 * var mod = require('role.tower');
 * mod.thing == 'a thing'; // true
 */

const wallTargetHpMain = 24000
const wallTargetHpSecondary = 400

export function run(tower: Tower) {
    const targets = tower.room.find<Creep>(FIND_HOSTILE_CREEPS);
    if(targets.length > 0) {
        const target = targets[0]
        tower.attack(target)
    } else {
        let wallTargetHp = wallTargetHpSecondary
        if(tower.room.name=="E47N26") {
            wallTargetHp = wallTargetHpMain
        }
        let targets = tower.room.find<Structure>(FIND_STRUCTURES, {
            filter: (s:Structure) => (((s.structureType==STRUCTURE_WALL || s.structureType==STRUCTURE_RAMPART) && s.hits<0.7*wallTargetHp)
            || (s.structureType!=STRUCTURE_WALL && s.structureType!=STRUCTURE_RAMPART && s.hits<(s.hitsMax*0.5)))
            && ((s as OwnedStructure).my || (s as OwnedStructure).owner===undefined)
        });
        //console.log("repair: " + targets)
        if(targets.length) {
            const target = targets[0] // better selection? + filter more
            var err = null;
            err = tower.repair(target)
            if(err != OK) {
                console.log("Tower err: " + err)
            }
        }
    }
}
