
import * as utils from '../utils'



export function run(creep: Creep): void {
    let mem = creep.memory as HarvesterMemory
    if(mem.transfering && creep.carry.energy <= 0) {
        mem.transfering = false;
        mem.tId = undefined
        creep.say("-> harv")
    }
    if(!mem.transfering && creep.carry.energy == creep.carryCapacity) {
        mem.transfering = true;
    }

    if(!mem.transfering) {
        var sources = creep.room.find<Source>(FIND_SOURCES);
        var sourceid = 0 //mem.source || 0;
        //creep.say(creep.name + " " + (mem.source || 0))
        var err = creep.harvest(sources[sourceid])
        if(err == ERR_NOT_IN_RANGE) {
            creep.moveTo(sources[sourceid]);
        } else if(err == ERR_NOT_ENOUGH_ENERGY) {
            if(creep.harvest(sources[1]) == ERR_NOT_IN_RANGE) {
                creep.moveTo(sources[sourceid]);
            }
        }
    }
    else {
        let target = null //Game.getObjectById(mem.tId);
        // should retarget from time to time too
        if(target==null) {
            // searching for target
            //creep.say("Targeting")

            const targets = creep.room.find<Structure>(FIND_STRUCTURES, {
                    filter: (structure: Structure) => {
                        return (structure.structureType == STRUCTURE_EXTENSION || structure.structureType == STRUCTURE_SPAWN || structure.structureType == STRUCTURE_TOWER)
                        &&    (structure as StructureExtension|StructureSpawn|StructureTower).energy < (structure as StructureExtension|StructureSpawn|StructureTower).energyCapacity
                        ;
                    }
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
            } else {
                const targets = creep.room.find<Creep>(FIND_MY_CREEPS, {
                        filter: (c:Creep) => { return (c.memory.role == "carry") && !c.memory.unload
                            && (c.carry.energy < c.carryCapacity)
                            && utils.distanceApprox(creep,c)<5 }
                });
                if(targets.length > 0) {
                    target = targets[0]
                    // simple approximate find nearest one!
                    var dist = Math.abs(target.pos.x-creep.pos.x)+Math.abs(target.pos.y-creep.pos.y)
                    for(let i=1; i<targets.length;i++) {
                        var alt = targets[i]
                        const altD = Math.abs(creep.pos.x-alt.pos.x)+Math.abs(creep.pos.y-alt.pos.y)
                        if(altD<dist) {
                            dist = altD
                            target = alt
                        }
                    }
                } else {
                    let target = null //Game.getObjectById(mem.tId);
                    let action = mem.action;
                    if(target==null) {
                        // look first for urgent repair
                        // only needed if room has no tower to handle this
                        // ! roads and collector are neutral
                        const targets = creep.room.find<Structure>(FIND_STRUCTURES, {
                            filter: (s:Structure) => s.structureType==STRUCTURE_WALL && s.hits<100
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
                        let err
                        if(action=="repair") {
                            const _target = target as Structure
                            if((target.structureType!=STRUCTURE_WALL && target.structureType!=STRUCTURE_RAMPART && _target.hits>=_target.hitsMax)) {
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
            }

            if(target) {
                mem.tId = target.id
            }
        }
        if(target) {
            const res = creep.transfer(target, RESOURCE_ENERGY)
            if(res == ERR_NOT_IN_RANGE) {
                // check target full here to avoid moves
                if( ((target as Creep).carry && ((target as Creep).carry.energy>=(target as Creep).carryCapacity-20 || ((target as Creep).memory as CarryMemory).unload))
                ||  ((target as Spawn).energyCapacity && (target as Spawn).energy==(target as Spawn).energyCapacity) ) {
                    //creep.say("Targetfull")
                    mem.tId = undefined
                } else {
                    creep.moveTo(target);
                }
            } else if(res == ERR_FULL) {
                //creep.say("Targetfull")
                mem.tId = undefined
            }
        }
    }
}
