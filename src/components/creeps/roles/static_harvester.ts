//import * as utils from'../utils'

interface SetupSHMemory extends CreepMemory {
    source?: number
    tId?: string
}


export function run(creep: Creep): void {
    let mem = creep.memory as SetupSHMemory
    var sources = creep.room.find<Source>(FIND_SOURCES);
    var sourceid = mem.source || 0;
    if(creep.harvest(sources[sourceid]) == ERR_NOT_IN_RANGE) {
        creep.moveTo(sources[sourceid]);
    }

    var target = Game.getObjectById<Structure|Creep>(mem.tId);
    // should retarget from time to time too
    if(target==null) {
        // searching for target
        //creep.say("Targeting")

        let targets = creep.pos.findInRange<Structure>(FIND_STRUCTURES, 1)
        targets = targets.filter((structure) => {
                    return (structure.structureType == STRUCTURE_CONTAINER)
                    &&     (structure as Container).store.energy < (structure as Container).storeCapacity
                    ;
                });
        //console.log(targets)
        if(targets.length > 0) {
            target = targets[0]
        } else {
            let targets = creep.pos.findInRange<Creep>(FIND_MY_CREEPS, 1)
            targets = targets.filter((c) => { return (c.memory.role == "carry")
                        && (c.carry.energy < c.carryCapacity)
            });
            if(targets.length > 0) {
                target = targets[0]
                // simple approximate find nearest one!
                let dist = Math.abs(target.pos.x-creep.pos.x)+Math.abs(target.pos.y-creep.pos.y)
                for(let i=1; i<targets.length;i++) {
                    const alt = targets[i]
                    const altD = Math.abs(creep.pos.x-alt.pos.x)+Math.abs(creep.pos.y-alt.pos.y)
                    if(altD<dist) {
                        dist = altD
                        target = alt
                    }
                }
            }
        }

        if(target) {
            mem.tId = target.id
        }
    }

    if(target) {
        // can do both transfert and harvest
        const res = creep.transfer(target, RESOURCE_ENERGY)
        if(res != OK) {
            mem.tId = undefined
        }
    }
}
