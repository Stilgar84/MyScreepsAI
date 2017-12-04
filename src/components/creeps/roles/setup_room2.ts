import * as move2room2 from'../actions/move2room2'


export function run(creep: Creep): void {
    if(!move2room2.move(creep)) {
        return
    }
    let mem = creep.memory as SetupR2Memory

    if(mem.building && creep.carry.energy == 0) {
        mem.building = false;
        mem.tId = undefined
    }
    if(!mem.building && creep.carry.energy == creep.carryCapacity) {
        mem.building = true;
    }

    if(mem.building) {
        let target = null //Game.getObjectById(mem.tId);
        let action = mem.action;
        if(target==null) {
            // look first for urgent repair
            // only needed if room has no tower to handle this
            // ! roads and collector are neutral
            const targets = creep.room.find<Structure>(FIND_STRUCTURES, {
                filter: (s: Structure) => s.structureType==STRUCTURE_WALL && s.hits<100
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
            var err = null;
            if(action=="repair") {
                let _target = target as Structure
                if(_target.hits==_target.hitsMax) {
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
            if(creep.room.controller && creep.upgradeController(creep.room.controller) == ERR_NOT_IN_RANGE) {
                creep.moveTo(creep.room.controller);
            }
        }
    }
    else {
        var sources = creep.room.find<Source>(FIND_SOURCES);
        var srcId = 0
        if(creep.harvest(sources[srcId]) == ERR_NOT_IN_RANGE) {
            creep.moveTo(sources[srcId]);
        }
    }
}
