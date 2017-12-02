
export function distanceApprox(o1: RoomObject, o2: RoomObject): number {
    return Math.abs(o1.pos.x-o2.pos.x)+Math.abs(o1.pos.y-o2.pos.y)
}

export function moveToFlag(creep: Creep, flagName: string): boolean {
    let targets = creep.room.find<Flag>(FIND_FLAGS);
    targets = targets.filter((o) => o.name==flagName)
    if(targets.length>0) {
        if(creep.pos.isEqualTo(targets[0].pos)) {
            return true
        } else {
            creep.moveTo(targets[0]);
            return false
        }
    } else {
        console.log("Flag not found")
        return true
    }
}
