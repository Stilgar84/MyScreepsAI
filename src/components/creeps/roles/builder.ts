
import * as roleUpgrader from './upgrader'

const wallTargetHp = 20000
export function run(creep: Creep): void {
    let mem = creep.memory as BuilderMemory
    let target = Game.getObjectById<ConstructionSite | Structure>(mem.tId);
    let action = mem.action;
    if(target==null) {
        // look first for urgent repair
        // only needed if room has no tower to handle this
        // ! roads and collector are neutral
        const targets = creep.room.find<Structure>(FIND_STRUCTURES, {
            filter: (s: Structure) => (
                ((s.structureType==STRUCTURE_WALL || s.structureType==STRUCTURE_RAMPART) && s.hits<0.7*wallTargetHp)
                || (s.structureType!=STRUCTURE_WALL && s.structureType!=STRUCTURE_RAMPART && s.hits<(s.hitsMax*0.5)))
             && ((s as OwnedStructure).my || (s as OwnedStructure).owner===undefined)
        });
        //console.log("repair: " + targets)
        if(targets.length) {
            target = targets[0] // better selection? + filter more
            action = "repair"
        } else {
            const targets = creep.room.find<ConstructionSite>(FIND_MY_CONSTRUCTION_SITES);
            if(targets.length) {
                target = targets[0] // select the oldest construction site
                action = "build"
            }
        }

        if(target) {
            mem.tId = target.id
            mem.action = action
        }
    }
    if(target) {
        let err;
        if(action=="repair") {
            const _target = target as Structure
            if(((target.structureType==STRUCTURE_WALL || target.structureType==STRUCTURE_RAMPART) && _target.hits>=wallTargetHp)
            || (target.structureType!=STRUCTURE_WALL && target.structureType!=STRUCTURE_RAMPART && _target.hits>=_target.hitsMax)) {
                mem.tId = undefined
            }
            err = creep.repair(_target)
        } else {
            err = creep.build(target as ConstructionSite)
        }
        if(err == ERR_NOT_IN_RANGE) {
            creep.moveTo(target);
        } else if(err == ERR_INVALID_TARGET) {
            mem.tId = undefined
        }
    } else {
        // fallback on upgrader logic if there is nothing to build
        roleUpgrader.run(creep)
    }
}
