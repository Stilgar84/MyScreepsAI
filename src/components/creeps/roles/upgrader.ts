import { log } from "../../../lib/logger/log";
import { move2Pos } from "../actions/move";


//import * as utils from '../utils'

export function run(creep: Creep, mem: UpgraderMemory): void {
    switch(mem.state) {
        case undefined:
            findPos(creep, mem);
            // fallthrough
        case "mv":
            if(move2Pos(creep, mem.pos||[25,25])) {
                mem.state = "u"
                mem.pos = undefined
                // fallthrough
            } else {
                break
            }
        case "u":
            upgrade(creep, mem.containerId||"")
            break;
    }
}

function findPos(creep: Creep, mem: UpgraderMemory) {
    const src = Game.getObjectById<Source>(mem.tId)
    if(!src || src.room != creep.room) {
        log.error("Invalid source id, either not existing or wrong room:", creep.name)
        return
    }
    const structs = src.pos.findInRange<Structure>(FIND_STRUCTURES, 1)
    const containers = structs.filter((s)=>s.structureType==STRUCTURE_CONTAINER)
    if(containers.length==0 || containers.length>2) {
        log.error("Missing (or >2) containers near source", creep.name)
        return
    }
    var container = containers[0]
    if(containers.length==2) {
        if(container.pos.findInRange(FIND_SOURCES,1).length>1) {
            container = containers[1]
        }
    }
    // todo could store the path here? game already do some caching so don't be too smart for now
    //creep.pos.findPathTo()
    mem.pos = [container.pos.x, container.pos.y]
    mem.state = "mv"
}

function upgrade(creep: Creep, containerId: string) {
    if(creep.carry.energy==0)
    {
        const container = Game.getObjectById<Container>(containerId)
        if(!container || container.room != creep.room) {
            log.error("Invalid container id, either not existing or wrong room:", creep.name)
            return
        }

        // withdraw and upgradeController cannot be run on same tick
        creep.withdraw(container, RESOURCE_ENERGY)
    } else {
        const src = creep.room.controller
        if(!src) {
            log.error("No controller in room:", creep.name)
            return
        }
        const res = creep.upgradeController(src)
        switch(res) {
            case OK:
                return
            default:
                log.warning("Error while upgrading:", creep.name, res)
                break
        }
    }
}

// temporary keep

export function runOld(creep: Creep): void {
    //state = creep.memory.state || 0
    if(creep.carry.energy>0) {
        if(creep.room.controller && creep.upgradeController(creep.room.controller) == ERR_NOT_IN_RANGE) {
            creep.moveTo(creep.room.controller);
        }
    }
    else {
        const sources = creep.room.find<Flag>(FIND_FLAGS, {
            filter: (c: Flag) => c.name=="Reload" || c.name=="Reload2"
        });
        if(sources.length==0) {
            creep.say("NoFlag")
        } else {
            creep.moveTo(sources[0]);
            let targets = creep.pos.findInRange<Structure>(FIND_STRUCTURES, 1)
            targets = targets.filter((structure) => {
                return (structure.structureType == STRUCTURE_CONTAINER)
                &&            (structure as Container).store.energy > 0
                ;
            });
            //console.log(creep.name, targets)
            if(targets.length > 0) {

                const target = targets[0]
                console.log(creep.name, target)
                creep.withdraw(target, RESOURCE_ENERGY)
            }
        }
    }
}
