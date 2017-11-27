var roleHarvester = require('role.harvester');
var roleUpgrader = require('role.upgrader');
var roleBuilder = require('role.builder');
var roleCarry = require('role.carry')

module.exports.loop = function () {

    for(var name in Memory.creeps) {
        if(!Game.creeps[name]) {
            delete Memory.creeps[name];
        }
    }

    var harvesters = _.filter(Game.creeps, (creep) => creep.memory.role == 'harvester');
//    console.log('Harvesters: ' + harvesters.length);

    if(harvesters.length < 3) {
        srcid = 1-Memory.prevSrc
        Memory.prevSrc = srcid
        //var newName = Game.spawns.Sp1.createCreep([WORK,CARRY,MOVE], undefined, {role: 'harvester', source: srcid});
        var newName = Game.spawns.Sp1.createCreep([WORK,WORK,WORK,CARRY,MOVE,CARRY,MOVE], undefined, {role: 'harvester', source: srcid});
//        console.log('Spawning new harvester: ' + newName);
    }
    
    var upgrader = _.filter(Game.creeps, (creep) => creep.memory.role == 'upgrader');
    if(upgrader.length < 4) {
        var newName = Game.spawns.Sp1.createCreep([WORK, WORK, WORK,CARRY,MOVE,MOVE], undefined, {role: 'upgrader'});
//        console.log('Spawning new harvester: ' + newName);
    }

    var builder = _.filter(Game.creeps, (creep) => creep.memory.role == 'builder');
    if(builder.length < 3) {
        var newName = Game.spawns.Sp1.createCreep([WORK,WORK,WORK,CARRY,MOVE,CARRY,MOVE], undefined, {role: 'builder'});
//        console.log('Spawning new harvester: ' + newName);
    }
    
    var carryer = _.filter(Game.creeps, (creep) => creep.memory.role == 'carry');
    if(carryer.length < 7) {
        var newName = Game.spawns.Sp1.createCreep([CARRY, CARRY, CARRY, CARRY, MOVE, MOVE, MOVE, MOVE], undefined, {role: 'carry'});
    }

    for(var name in Game.creeps) {
        var creep = Game.creeps[name];
        if(creep.memory.role == 'harvester') {
            roleHarvester.run(creep);
        }
        if(creep.memory.role == 'upgrader') {
            roleUpgrader.run(creep);
        }
        if(creep.memory.role == 'builder') {
            roleBuilder.run(creep);
        }
        if(creep.memory.role == 'carry') {
            roleCarry.run(creep);
        }
    }
}