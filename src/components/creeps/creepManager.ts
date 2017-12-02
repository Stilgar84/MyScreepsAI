//import * as Config from "../../config/config";

import * as roleBuilder from "./roles/builder";
import * as roleUpgrader from "./roles/upgrader";
import * as roleCarry from "./roles/carry";
import * as roleTower from "./roles/tower";
import * as roleHarvester from "./roles/harvester";
import * as roleStaticHarvester from "./roles/static_harvester";
import * as attack_room2 from "./roles/attack_room2";
import * as claim_room2 from "./roles/claim_room2";
import * as setup_room2 from "./roles/setup_room2";

import { log } from "../../lib/logger/log";

/**
 * Initialization scripts for CreepManager module.
 *
 * @export
 * @param {Room} room
 */
export function run(room: Room): void {
  const creeps = room.find<Creep>(FIND_MY_CREEPS);

  _buildMissingCreeps(/*room, creeps*/);

  _.each(creeps, (creep: Creep) => {
    if(creep.memory.role == 'harvester') {
      roleHarvester.run(creep);
    } else if(creep.memory.role == 'upgrader') {
      roleUpgrader.run(creep);
    } else if(creep.memory.role == 'builder') {
      roleBuilder.run(creep);
    } else if(creep.memory.role == 'carry') {
      roleCarry.run(creep);
    } else if(creep.memory.role == 'sharvester') {
      roleStaticHarvester.run(creep);
    } else if(creep.memory.role == 'attack_room2') {
      // Game.spawns.Sp1.createCreep([ATTACK,MOVE], undefined, {role: 'attack_room2'});
      attack_room2.run(creep)
    } else if(creep.memory.role == 'claim_room2') {
      // Game.spawns.Sp1.createCreep([CLAIM,MOVE], undefined, {role: 'claim_room2'});
      claim_room2.run(creep)
    } else if(creep.memory.role == 'setup_room2') {
      // Game.spawns.Sp1.createCreep([WORK,WORK,WORK,WORK, CARRY, CARRY, CARRY, CARRY, MOVE, MOVE, MOVE, MOVE], undefined, {role: 'setup_room2'});
      setup_room2.run(creep)
    }
  });

  const towers = room.find<Tower>(FIND_MY_STRUCTURES, {filter: (s:Structure) => s.structureType==STRUCTURE_TOWER});
  _.each(towers, roleTower.run)
}

/**
 * Creates a new creep if we still have enough space.
 *
 * @param {Room} room
 */

 // currently work on two room by a big hack
function _buildMissingCreeps(/*room: Room, creeps: Creep[]*/) {
    // about 50 tick to replace, so ignore nearly dead one
    const harvesters = _.filter(Game.creeps, (creep) => creep.memory.role == 'sharvester' && creep.ticksToLive>100);
    if(harvesters.length < 6) {
        let h1 = _.filter(harvesters, (creep) => (creep.memory as StaticHarvMemory).source==0);

        let srcid
        if(h1.length<3) {
            srcid = 0
        } else {
            srcid = 1
        }
        let newName = Game.spawns.Sp1.createCreep([WORK,WORK,CARRY,MOVE], undefined, <StaticHarvMemory>{role: 'sharvester', source: srcid});
        log.info("Spawning a new StaticHarvester:", newName)
        //let newName = Game.spawns.Sp1.createCreep([WORK,WORK,WORK,CARRY,MOVE,CARRY,MOVE], undefined, {role: 'harvester', source: srcid});
//        console.log('Spawning new harvester: ' + newName);
    }
    let builder = _.filter(Game.creeps, (creep) => creep.memory.role == 'builder');
    if(builder.length < 3) {
        let newName = Game.spawns.Sp1.createCreep([WORK, WORK, WORK,WORK,CARRY,CARRY,MOVE,MOVE,MOVE], undefined, {role: 'builder'});
        log.info("Spawning a new builder:", newName)
//        let newName = Game.spawns.Sp1.createCreep([WORK,WORK,WORK,CARRY,MOVE,CARRY,MOVE], undefined, {role: 'builder'});
//        console.log('Spawning new harvester: ' + newName);
    }

    let upgrader = _.filter(Game.creeps, (creep) => creep.memory.role == 'upgrader');
    if(upgrader.length < 1) {
        //let newName = Game.spawns.Sp1.createCreep([WORK, WORK, WORK,CARRY,MOVE,MOVE], undefined, {role: 'upgrader'});
        let newName = Game.spawns.Sp1.createCreep([WORK,WORK, WORK, WORK, CARRY,MOVE], undefined, {role: 'upgrader'});
        log.info("Spawning a new upgrader:", newName)
//        console.log('Spawning new harvester: ' + newName);
    }

    const ncarry1 = 6
    const ncarry2 = 6
    let carryer = _.filter(Game.creeps, (creep) => creep.memory.role == 'carry' && creep.my);
    if(carryer.length < ncarry1+ncarry2) {
        let carryerA = _.filter(carryer, (creep) => (creep.memory as CarryMemory).flagName=="LoadingFlag");
        if(carryerA.length < ncarry1) {
            let newName = Game.spawns.Sp1.createCreep([CARRY, CARRY, CARRY, MOVE, MOVE, MOVE], undefined, <CarryMemory>{role: 'carry', flagName: "LoadingFlag"});
            log.info("Spawning a new carry:", newName)
        } else {
            let newName = Game.spawns.Sp1.createCreep([CARRY, CARRY, CARRY, MOVE, MOVE, MOVE], undefined, <CarryMemory>{role: 'carry', flagName: "Loading2"});
            log.info("Spawning a new carry:", newName)
        }
    }


    var harvesters2 = _.filter(Game.creeps, (creep) => creep.memory.role == 'harvester');
    //    console.log('Harvesters: ' + harvesters.length);

        if(harvesters2.length < 6) {
            const h1 = _.filter(harvesters, (creep) => (creep.memory as HarvesterMemory).source==0);
            let srcid
            if(h1.length<3) {
                srcid = 0
            } else {
                srcid = 1
            }
            const newName = Game.spawns.Sp2.createCreep([WORK,CARRY,MOVE,WORK,CARRY,MOVE], undefined, <HarvesterMemory>{role: 'harvester', source: srcid});
            if(newName == ERR_BUSY || newName == ERR_NOT_ENOUGH_RESOURCES){}
            else {
              log.info("Spawning a new harvester:", newName)
            }
            //var newName = Game.spawns.Sp1.createCreep([WORK,WORK,WORK,CARRY,MOVE,CARRY,MOVE], undefined, {role: 'harvester', source: srcid});
    //        console.log('Spawning new harvester: ' + newName);
        }

  /*
  let bodyParts: BodyPartConstant[];

  // Iterate through each creep and push them into the role array.
  const harvesters = _.filter(creeps, (creep) => creep.memory.role === "harvester");

  const spawns: Spawn[] = room.find<Spawn>(FIND_MY_SPAWNS, {
    filter: (spawn: Spawn) => {
      return spawn.spawning === null;
    },
  });

  if (Config.ENABLE_DEBUG_MODE) {
    if (spawns[0]) {
      log.info("Spawn: " + spawns[0].name);
    }
  }

  if (harvesters.length < 2) {
    if (harvesters.length < 1 || room.energyCapacityAvailable <= 800) {
      bodyParts = [WORK, WORK, CARRY, MOVE];
    } else if (room.energyCapacityAvailable > 800) {
      bodyParts = [WORK, WORK, WORK, WORK, CARRY, CARRY, MOVE, MOVE];
    }

    _.each(spawns, (spawn: Spawn) => {
      _spawnCreep(spawn, bodyParts, "harvester");
    });
  }
  */
}

/**
 * Spawns a new creep.
 *
 * @param {Spawn} spawn
 * @param {BodyPartConstant[]} bodyParts
 * @param {string} role
 * @returns
 *
function _spawnCreep(spawn: Spawn, bodyParts: BodyPartConstant[], role: string) {
  const uuid: number = Memory.uuid;
  let status: number | string = spawn.canCreateCreep(bodyParts, undefined);

  const properties: CreepMemory = {
    role,
    room: spawn.room.name,
    working: false
  };

  status = _.isString(status) ? OK : status;
  if (status === OK) {
    Memory.uuid = uuid + 1;
    const creepName: string = spawn.room.name + " - " + role + uuid;

    log.info("Started creating new creep: " + creepName);
    if (Config.ENABLE_DEBUG_MODE) {
      log.info("Body: " + bodyParts);
    }

    status = spawn.createCreep(bodyParts, creepName, properties);

    return _.isString(status) ? OK : status;
  } else {
    if (Config.ENABLE_DEBUG_MODE) {
      log.info("Failed creating new creep: " + status);
    }

    return status;
  }
}
*/
