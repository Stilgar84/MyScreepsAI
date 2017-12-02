
import * as utils from '../utils'

export function run(creep: Creep): void {
    let mem = creep.memory as CarryMemory
    if(mem.unload && creep.carry.energy == 0) {
        mem.unload = false;
        mem.tId = undefined;
    }
    if(!mem.unload && creep.carry.energy == creep.carryCapacity) {
        mem.unload = true;
    }

    //console.log('Carry: ' + mem.unload +" - " + creep.carry.energy);

    if(mem.unload) {
        // kill perf, and make carry change their mind all the time
        let target: Structure|Creep|null = null // = Game.getObjectById(mem.tId);
        //if(target==null || (target.carry && target.carry.energy == target.carryCapacity)) {
            // searching for target
            // creep.say("Targeting")


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
                        filter: (c:Creep) => { return (c.memory.role == "upgrader" || c.memory.role == "builder")
                            && (c.carry.energy < c.carryCapacity-20)
                            /*&& utils.distanceApprox(creep,c)<10*/ }
                });
                if(targets.length > 0) {
                    target = targets[0] // take least full then nearest
                    let dist = target.carry.energy + utils.distanceApprox(creep,target)*15
                    for(let i=1; i<targets.length;i++) {
                        const alt = targets[i]
                        const altD = alt.carry.energy + utils.distanceApprox(creep,alt)*15
                        if(altD<dist) {
                            dist = altD
                            target = alt
                        }
                    }
                } else {
                    const targets = creep.room.find<Flag>(FIND_FLAGS, {
                            filter: (c: Flag) => c.name=="UpgradeFlag"
                    });
                    if(targets.length > 0) {
                        creep.moveTo(targets[0]);
                    }
                }
            }

            if(target) {
                mem.tId = target.id
            }
        //}
        if(target) {
            const res = creep.transfer(target, RESOURCE_ENERGY)
            if(res == ERR_NOT_IN_RANGE) {
                creep.moveTo(target);
            } /*else if(res == ERR_FULL) {
                creep.say("Targetfull");
                mem.tId = null;
            }*/
            else {
                mem.tId = undefined; // only keep target for move
            }
        }
    }
    else {
        const flagName = mem.flagName || "LoadingFlag";
        mem.flagName = flagName
        let targets = creep.room.find<Flag>(FIND_FLAGS);
        targets = targets.filter((o) => o.name==flagName)
        if(targets.length) {
            if(creep.pos.isEqualTo(targets[0].pos)) {
                let targets = creep.pos.findInRange<Structure>(FIND_STRUCTURES, 1)
                targets = targets.filter((structure) => {
                    return (structure.structureType == STRUCTURE_CONTAINER)
                    &&                            (structure as StructureContainer).store.energy > 0
                    ;
                });
                if(targets.length > 0) {
                    const target = targets[0]
                    creep.withdraw(target, RESOURCE_ENERGY)
                }
            } else {
                creep.moveTo(targets[0]);
            }
        }
    }
}
