import { log } from "../../../lib/logger/log";

//import * as utils from '../utils'


export function run(creep: Creep, mem: DropHarvesterMemory): void {
    switch(mem.state) {
        case undefined:
            findPos(creep, mem);
            // fallthrough
        case "mv":
            if(move2Pos(creep, mem.pos||[25,25])) {
                mem.state = "h"
                mem.pos = undefined
                // fallthrough
            } else {
                break
            }
        case "h":
            harvest(creep, mem.tId)
            break;
    }
}

function findPos(creep: Creep, mem: DropHarvesterMemory) {
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

// This is quite generic. reuse once put in place cpu optim of putting creep to sleep
function move2Pos(creep: Creep, pos:[number, number]): boolean {
    if(creep.pos.x==pos[0] && creep.pos.y==pos[1])
        return true

    if(creep.fatigue==0)
        creep.moveTo(pos[0],pos[1])

    return false
}

function harvest(creep: Creep, srcId: string) {
    const src = Game.getObjectById<Source>(srcId)
    if(!src) {
        log.error("Invalid source id, either not existing or wrong room:", creep.name)
        return
    }
    const res = creep.harvest(src)
    switch(res) {
        case OK:
            return
        default:
            log.warning("Error while harvesting:", creep.name, res)
            break
    }
}
