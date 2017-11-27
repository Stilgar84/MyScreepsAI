var roleHarvester = require('role.harvester');
var roleStaticHarvester = require('role.static_harvester');
var roleUpgrader = require('role.upgrader');
var roleBuilder = require('role.builder');
var roleCarry = require('role.carry')
var roleTower = require('role.tower')

// todo collect stats (or setup grafana)
//   collection rate
//   speding on build, repair, spawn, upgrade...

module.exports.loop = function () {

    for(var name in Memory.creeps) {
        if(!Game.creeps[name]) {
            delete Memory.creeps[name];
        }
    }

    // about 50 to replace, so ignore nearly dead one
    var harvesters = _.filter(Game.creeps, (creep) => creep.memory.role == 'sharvester' && creep.ticksToLive>100);
//    console.log('Harvesters: ' + harvesters.length);

    if(harvesters.length < 6) {
        var h1 = _.filter(harvesters, (creep) => creep.memory.source==0);
        if(h1.length<3) {
            srcid = 0
        } else {
            srcid = 1
        }
        var newName = Game.spawns.Sp1.createCreep([WORK,WORK,CARRY,MOVE], undefined, {role: 'sharvester', source: srcid});
        //var newName = Game.spawns.Sp1.createCreep([WORK,WORK,WORK,CARRY,MOVE,CARRY,MOVE], undefined, {role: 'harvester', source: srcid});
//        console.log('Spawning new harvester: ' + newName);
    }
    var builder = _.filter(Game.creeps, (creep) => creep.memory.role == 'builder');
    if(builder.length < 3) {
        var newName = Game.spawns.Sp1.createCreep([WORK, WORK, WORK,CARRY,MOVE,MOVE], undefined, {role: 'builder'});

//        var newName = Game.spawns.Sp1.createCreep([WORK,WORK,WORK,CARRY,MOVE,CARRY,MOVE], undefined, {role: 'builder'});
//        console.log('Spawning new harvester: ' + newName);
    }
    
    var upgrader = _.filter(Game.creeps, (creep) => creep.memory.role == 'upgrader');
    if(upgrader.length < 2) {
        //var newName = Game.spawns.Sp1.createCreep([WORK, WORK, WORK,CARRY,MOVE,MOVE], undefined, {role: 'upgrader'});
        var newName = Game.spawns.Sp1.createCreep([WORK,WORK, WORK, CARRY,MOVE], undefined, {role: 'upgrader'});
//        console.log('Spawning new harvester: ' + newName);
    }

    const ncarry1 = 6
    const ncarry2 = 5
    var carryer = _.filter(Game.creeps, (creep) => creep.memory.role == 'carry' && creep.my);
    if(carryer.length < ncarry1+ncarry2) {
        var carryerA = _.filter(carryer, (creep) => creep.memory.flagName=="LoadingFlag");
        if(carryerA.length < ncarry1) {
            var newName = Game.spawns.Sp1.createCreep([CARRY, CARRY, CARRY, MOVE, MOVE, MOVE], undefined, {role: 'carry', flagName: "LoadingFlag"});
        } else {
            var newName = Game.spawns.Sp1.createCreep([CARRY, CARRY, CARRY, MOVE, MOVE, MOVE], undefined, {role: 'carry', flagName: "Loading2"});
        }
    }

    for(var name in Game.creeps) {
        var creep = Game.creeps[name];
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
        }
    }
    towers = _.filter(Game.structures, (s)=>s.structureType==STRUCTURE_TOWER)
    for(var tower in towers) {
        roleTower.run(towers[tower])
    }
}