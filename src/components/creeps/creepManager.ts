//import * as Config from "../../config/config";

import * as roleBuilder from "./roles/builder";
import * as roleUpgrader from "./roles/upgrader";
import * as roleCarry from "./roles/carry";
import * as roleTower from "./roles/tower";
import * as roleHarvester from "./roles/harvester";
import * as roleDropHarvester from "./roles/dropharvester";
import * as roleStaticHarvester from "./roles/static_harvester";
import * as attack_room2 from "./roles/attack_room2";
import * as claim_room2 from "./roles/claim_room2";
import * as setup_room2 from "./roles/setup_room2";
import * as low_rcl from "./roles/low_rcl";

import { log } from "../../lib/logger/log";
import {runCreep} from "./action_system"

/**
 * Initialization scripts for CreepManager module.
 *
 * @export
 * @param {Room} room
 */
export function run(room: Room): void {
  const creeps = room.find<Creep>(FIND_MY_CREEPS);

  _buildMissingCreeps(room, creeps);
  _buildMissingCreepsGlobal()

  _.each(creeps, (creep: Creep) => {
    switch(creep.memory.role) {
      case 'dh':
        roleDropHarvester.run(creep,creep.memory)
        break
      case 'harvester':
        roleHarvester.run(creep);
        break
      case 'upgrader':
        roleUpgrader.run(creep, creep.memory);
        break
      case 'builder':
        roleBuilder.run(creep);
        break
      case 'carry':
        roleCarry.run(creep);
        break
      case 'sharvester':
        roleStaticHarvester.run(creep);
        break
      case 'attack_room2':
        // Game.spawns.Sp1.createCreep([ATTACK,MOVE], undefined, {role: 'attack_room2'});
        attack_room2.run(creep)
        break
      case 'claim_room2':
        // Game.spawns.Sp1.createCreep([CLAIM,MOVE], undefined, {role: 'claim_room2'});
        claim_room2.run(creep)
        break
      case 'setup_room2':
        // Game.spawns.Sp1.createCreep([WORK,WORK,WORK,WORK, CARRY, CARRY, CARRY, CARRY, MOVE, MOVE, MOVE, MOVE], undefined, {role: 'setup_room2'});
        setup_room2.run(creep)
        break
      case 'AS':
        runCreep(creep, creep.memory)
        break
      /*default:
        log.error("Unknown creep role:", creep.memory.role)*/
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

const DHTickToLiveBeforeReplace = 75

 // currently work on two room by a big hack
function _buildMissingCreeps(room: Room, creeps: Creep[]) {
  if(!room.controller)
    return

  if(room.controller.level<3) {
    if(creeps.length<5) {
      let config = [MOVE,MOVE,CARRY,WORK]
      if(room.energyCapacityAvailable>=500)
        config = [...config, ...config]
      spawnCreep(room, config, low_rcl.make())
      return
    }
  } else {
    let rid=1
    if(room.name=="E46N27")
      rid=2

    //log.debug(room, creeps.map((c)=>c.memory.role))
    // could replace those two by an array of id alive
    let numDH = 0
    let lastSrcId

    let numCarrya = 0
    let numCarryb = 0

    let numBuilder = 0
    let numUpgrader = 0

    creeps.forEach((c)=>{
      const mem = c.memory
      switch(mem.role) {
        case 'dh':
          if(c.ticksToLive>DHTickToLiveBeforeReplace) {
            numDH+=1
            lastSrcId = mem.tId
          }
          break
        case 'carry':
          if(mem.flagName=="Loading1a" || mem.flagName=="Loading2a")
            numCarrya+=1
          else
            numCarryb+=1
          break
        case 'builder':
          numBuilder+=1
          break
        case 'upgrader':
          numUpgrader+=1
          break
      }
    })
    // by priority
    // TODO something smarter. need minimum one dh + one carry to aliment spawn
    //  so this should be the utmost priority
    if(numDH<2) {
      const srcs = room.find<Source>(FIND_SOURCES)
      for(const src of srcs) {
        if(src.id!=lastSrcId) {
          spawnCreep(room, [MOVE,MOVE,WORK,WORK,WORK,WORK,WORK], {role:'dh', tId:src.id})
          return
        }
      }
    }

    if(numBuilder < 3) {
        spawnCreep(room, [WORK, WORK, WORK,WORK,CARRY,CARRY,MOVE,MOVE,MOVE], {role: 'builder'});
        return
    }

    if(numUpgrader < 1) {
        spawnCreep(room, [WORK,WORK, WORK, WORK, CARRY,MOVE], {role: 'upgrader'});
        return
    }

    let ncarry = 5
    if(rid==2) {
      ncarry = 3
    }

    if(numCarrya < ncarry) {
      spawnCreep(room, [CARRY, CARRY, CARRY, MOVE, MOVE, MOVE], {role: 'carry', flagName: "Loading"+rid+"a"});
      return
    }
    if(numCarryb < ncarry) {
      spawnCreep(room, [CARRY, CARRY, CARRY, MOVE, MOVE, MOVE], {role: 'carry', flagName: "Loading"+rid+"b"});
      return
    }
  }
}
function _buildMissingCreepsGlobal(/*room: Room, creeps: Creep[]*/) {
    // about 50 tick to replace, so ignore nearly dead one
    /*
    const harvesters = _.filter(Game.creeps, (creep) => creep.memory.role == 'sharvester' && creep.ticksToLive>100);
    if(harvesters.length < 6) {
        let h1 = _.filter(harvesters, (creep) => (creep.memory as StaticHarvMemory).source==0);

        let srcid
        if(h1.length<3) {
            srcid = 0
        } else {
            srcid = 1
        }
        let newName = Game.spawns.Sp1.createCreep([WORK,WORK,CARRY,MOVE], undefined, {role: 'sharvester', source: srcid});
        log.info("Spawning a new StaticHarvester:", newName)
        //let newName = Game.spawns.Sp1.createCreep([WORK,WORK,WORK,CARRY,MOVE,CARRY,MOVE], undefined, {role: 'harvester', source: srcid});
//        console.log('Spawning new harvester: ' + newName);
    }
    */
/*
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
    }*/
/*
    const ncarry1 = 6
    const ncarry2 = 6
    let carryer = _.filter(Game.creeps, (creep) => creep.memory.role == 'carry' && creep.my);
    if(carryer.length < ncarry1+ncarry2) {
        let carryerA = _.filter(carryer, (creep) => (creep.memory as CarryMemory).flagName=="LoadingFlag");
        if(carryerA.length < ncarry1) {
            let newName = Game.spawns.Sp1.createCreep([CARRY, CARRY, CARRY, MOVE, MOVE, MOVE], undefined, {role: 'carry', flagName: "LoadingFlag"});
            log.info("Spawning a new carry:", newName)
        } else {
            let newName = Game.spawns.Sp1.createCreep([CARRY, CARRY, CARRY, MOVE, MOVE, MOVE], undefined, {role: 'carry', flagName: "Loading2"});
            log.info("Spawning a new carry:", newName)
        }
    }
*/
/*
    var harvesters2 = _.filter(Game.creeps, (creep) => creep.memory.role == 'harvester');
    //    console.log('Harvesters: ' + harvesters.length);

        if(harvesters2.length < 9) {
            const h1 = _.filter(harvesters2, (creep) => (creep.memory as HarvesterMemory).source==0);
            let srcid
            if(h1.length<3) {
                srcid = 0
            } else {
                srcid = 1
            }
            const newName = Game.spawns.Sp2.createCreep([WORK,CARRY,MOVE,WORK,CARRY,MOVE], undefined, {role: 'harvester', source: srcid});
            if(newName == ERR_BUSY || newName == ERR_NOT_ENOUGH_RESOURCES){}
            else {
              log.info("Spawning a new harvester:", newName)
            }
            //var newName = Game.spawns.Sp1.createCreep([WORK,WORK,WORK,CARRY,MOVE,CARRY,MOVE], undefined, {role: 'harvester', source: srcid});
    //        console.log('Spawning new harvester: ' + newName);
        }
*/
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
 */
function spawnCreep(room: Room, bodyParts: BodyPartConstant[], mem: CreepMemory) {
  let spawns = room.find<Spawn>(FIND_MY_SPAWNS)
  if(spawns.length==0)
  {
    log.error("No spawn in room", room)
    return ERR_INVALID_TARGET
  }
  let spawn = spawns[0]

  //const uuid: number = Memory.uuid;
  let status: number | string = spawn.canCreateCreep(bodyParts, undefined);

  status = _.isString(status) ? OK : status;
  if (status === OK) {
//    Memory.uuid = uuid + 1;
    //const creepName: string = spawn.room.name + " - " + role + uuid;

    status = spawn.createCreep(bodyParts, undefined, mem);

    if(_.isString(status)) {
      log.info("Started creating new creep:", status, bodyParts);
      return OK
    } else {
      log.error("Failed creating new creep:", status, bodyParts);
      return status
    }
  } else {
    log.error("Failed creating new creep:", status, bodyParts);
    return status;
  }
}
