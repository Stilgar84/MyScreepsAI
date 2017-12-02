import * as Config from "../../config/config";

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
  const creepCount = _.size(creeps);

  if (Config.ENABLE_DEBUG_MODE) {
    log.info(creepCount + " creeps found in the playground.");
  }

  _buildMissingCreeps(room, creeps);

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
function _buildMissingCreeps(room: Room, creeps: Creep[]) {
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
}

/**
 * Spawns a new creep.
 *
 * @param {Spawn} spawn
 * @param {BodyPartConstant[]} bodyParts
 * @param {string} role
 * @returns
 */
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
