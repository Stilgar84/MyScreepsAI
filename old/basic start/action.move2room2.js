/*
 * Module code goes here. Use 'module.exports' to export things:
 * module.exports.thing = 'a thing';
 *
 * You can import it from another modules like this:
 * var mod = require('action.move2room2');
 * mod.thing == 'a thing'; // true
 */

 
var utils = require('utils');

module.exports = {
    move: function(creep) {
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
};