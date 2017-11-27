var roleHarvester = require('role.harvester');
var roleStaticHarvester = require('role.static_harvester');
var roleUpgrader = require('role.upgrader');
var roleBuilder = require('role.builder');
var roleCarry = require('role.carry')

module.exports.loop = function () {

    for(var name in Memory.creeps) {
        if(!Game.creeps[name]) {
            delete Memory.creeps[name];
        }
    }

    var harvesters = _.filter(Game.creeps, (creep) => creep.memory.role == 'sharvester');
//    console.log('Harvesters: ' + harvesters.length);

    if(harvesters.length < 3) {
        // todo should build correct one
        srcid = 1-Memory.prevSrc
        Memory.prevSrc = srcid
        var newName = Game.spawns.Sp1.createCreep([WORK,WORK,CARRY,MOVE], undefined, {role: 'sharvester', source: srcid});
        //var newName = Game.spawns.Sp1.createCreep([WORK,WORK,WORK,CARRY,MOVE,CARRY,MOVE], undefined, {role: 'harvester', source: srcid});
//        console.log('Spawning new harvester: ' + newName);
    }
    var builder = _.filter(Game.creeps, (creep) => creep.memory.role == 'builder');
    if(builder.length < 3) {
        var newName = Game.spawns.Sp1.createCreep([WORK, WORK,CARRY,MOVE], undefined, {role: 'builder'});

//        var newName = Game.spawns.Sp1.createCreep([WORK,WORK,WORK,CARRY,MOVE,CARRY,MOVE], undefined, {role: 'builder'});
//        console.log('Spawning new harvester: ' + newName);
    }
    
    var upgrader = _.filter(Game.creeps, (creep) => creep.memory.role == 'upgrader');
    if(upgrader.length < 1) {
        //var newName = Game.spawns.Sp1.createCreep([WORK, WORK, WORK,CARRY,MOVE,MOVE], undefined, {role: 'upgrader'});
        var newName = Game.spawns.Sp1.createCreep([WORK, WORK, CARRY,MOVE], undefined, {role: 'upgrader'});
//        console.log('Spawning new harvester: ' + newName);
    }

    const ncarry1 = 5
    const ncarry2 = 5
    var carryer = _.filter(Game.creeps, (creep) => creep.memory.role == 'carry' && creep.my);
    if(carryer.length < ncarry1+ncarry2) {
        var carryerA = _.filter(Game.creeps, (creep) => creep.memory.role == 'carry' && creep.memory.flagName=="LoadingFlag");
        if(carryer.length < ncarry1) {
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
}