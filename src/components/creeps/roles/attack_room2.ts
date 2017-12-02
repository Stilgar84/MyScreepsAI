
import * as move2room2 from'../actions/move2room2'

export function run(creep: Creep): void {
    if(move2room2.move(creep)) {
        const targets = creep.room.find<Structure>(FIND_HOSTILE_STRUCTURES)
        if(targets.length>0) {
            const target = targets[0]
            const err = creep.attack(target)
            if(err == ERR_NOT_IN_RANGE) {
                creep.moveTo(target)
            }
        }
    }
}
