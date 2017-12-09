
import * as AS from '../action_system'
import * as utils from '../utils'


// always version actions (in case of state change)
namespace GoAndHarvestUntilFull_1 {
  export const id = "goharv.1"
  export function run(creep: Creep, state: number): AS.CreepActionReturn<number, void> {
    if(creep.carry.energy == creep.carryCapacity) {
      return { r:"c", v: undefined }
    }
    var sources = creep.room.find<Source>(FIND_SOURCES);
    var sourceid = state;
    var err = creep.harvest(sources[sourceid])
    if(err == ERR_NOT_IN_RANGE && creep.fatigue==0) {
        creep.moveTo(sources[sourceid]);
    } /*else if(err == ERR_NOT_ENOUGH_ENERGY) {
        if(creep.harvest(sources[1]) == ERR_NOT_IN_RANGE) {
            creep.moveTo(sources[sourceid]);
        }
    }*/
    return { r:"o", s: state }
  }

  AS.CreepActionRegistry.register(id, GoAndHarvestUntilFull_1)
}

// but alias current operation to latest version
const GoAndHarvestUntilFull = GoAndHarvestUntilFull_1

namespace DoStuffByPriority_1 {
  export const id = "dostuff.1"
  export function run(creep: Creep, state: void): AS.CreepActionReturn<void, void> {
    if(creep.carry.energy == 0) {
      return { r:"c", v: undefined }
    }
    let target = null //Game.getObjectById(mem.tId);
    let action = null
    // should retarget from time to time  but not always (untarget if target is full, built or repaired, or invalid)
    if(target==null) {
        const targets = creep.room.find<Structure>(FIND_STRUCTURES, {
                filter: (structure: Structure) => {
                    return (structure.structureType == STRUCTURE_EXTENSION || structure.structureType == STRUCTURE_SPAWN || structure.structureType == STRUCTURE_TOWER)
                    &&    (structure as StructureExtension|StructureSpawn|StructureTower).energy < (structure as StructureExtension|StructureSpawn|StructureTower).energyCapacity
                    ;
                }
        });
        if(targets.length > 0) {
            target = targets[0]
            let dist = utils.distanceApprox(target, creep)
            for(let i=1; i<targets.length;i++) {
                const alt = targets[i]
                const altD = utils.distanceApprox(alt, creep)
                if(altD<dist) {
                    dist = altD
                    target = alt
                }
            }
        } else {
            // look first for urgent repair
            // only needed if room has no tower to handle this
            // ! roads and collector are neutral
            const targets = creep.room.find<Structure>(FIND_STRUCTURES, {
                filter: (s:Structure) => s.structureType==STRUCTURE_WALL && s.hits<1000
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
        }
    }
    if(target) {
        let err
        if(action=="repair") {
            err = creep.repair(target as Structure)
        } else if(action=="build") {
            err = creep.build(target as ConstructionSite)
        } else {
            err = creep.transfer(target as Structure, RESOURCE_ENERGY)
        }
        if(err == ERR_NOT_IN_RANGE) {
            creep.moveTo(target);
        }
    } else {
        if(creep.room.controller && creep.upgradeController(creep.room.controller) == ERR_NOT_IN_RANGE) {
            creep.moveTo(creep.room.controller);
        }
    }
    return { r:"o", s: state }
  }

  AS.CreepActionRegistry.register(id, DoStuffByPriority_1)
}

const DoStuffByPriority = DoStuffByPriority_1


namespace Repeat_1 {
  export const id = "repeat.1"
  export function run(_creep: Creep, state: any): CreepASState {
    const n = state.as[state.cur]
    state.cur = (state.cur+1)%state.as.length
    return {role:"AS", ca:n.a, cas:n.s, oc: id, ocs: state}
  }

  AS.CreepHandlerRegistry.register(id, Repeat_1)
}

// but alias current operation to latest version
const Repeat = Repeat_1


export function make(): CreepASState {
  return {
    role: "AS",
    oc: Repeat.id,
    ocs: {
      cur: 0,
      as: [
        { a: GoAndHarvestUntilFull.id, s: 0 },
        { a: DoStuffByPriority.id }
      ]
    }
  }
  /*
  Forever(
    GoAndHarvestUntilFull
    FindBestAction
  )*/
}
