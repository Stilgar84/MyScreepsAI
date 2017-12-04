export function run(creep: Creep): void {
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

            let targets = creep.pos.findInRange<Structure>(FIND_STRUCTURES, 1)
            targets = targets.filter((structure) => {
                return (structure.structureType == STRUCTURE_CONTAINER)
                &&            (structure as Container).store.energy > 0
                ;
            });
            //console.log(creep.name, targets)
            if(targets.length > 0) {
                //console.log(creep.name)
                const target = targets[0]
                creep.withdraw(target, RESOURCE_ENERGY)
            } else {
                creep.moveTo(sources[0]);
            }
        }
    }
}
