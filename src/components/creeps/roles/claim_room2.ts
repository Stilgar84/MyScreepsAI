
import * as move2room2 from'../actions/move2room2'

export function run(creep: Creep): void {
    if(move2room2.move(creep)) {
        let targets = creep.room.find<Structure>(FIND_STRUCTURES, {
            filter: (s: Structure)=>s.structureType==STRUCTURE_CONTROLLER
        })
        if(targets.length>0) {
            const target = targets[0]
            const err = creep.claimController(target as Controller)
            if(err == ERR_NOT_IN_RANGE) {
                creep.moveTo(target)
            }
        }
    }
}
