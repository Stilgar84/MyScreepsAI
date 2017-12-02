
import * as utils from '../utils'

export function move(creep: Creep): boolean {
    if(creep.pos.roomName=="E46N27") {
        if(creep.pos.y==49) {
            creep.move(TOP)
        } else {
            return true
        }
    } else if(creep.pos.roomName=="E47N26") {
        utils.moveToFlag(creep, "T1")
    } else {
        if(creep.pos.y>20 || creep.pos.x>38) {
            utils.moveToFlag(creep, "S1")
        } else {
            utils.moveToFlag(creep, "T3")
        }
    }
    return false
}
