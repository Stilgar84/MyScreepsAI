
// See if can put in place cpu optim of putting creep to sleep (async prog with sleep)
export function move2Pos(creep: Creep, pos:[number, number]): boolean {
  if(creep.pos.x==pos[0] && creep.pos.y==pos[1])
      return true

  if(creep.fatigue==0)
      creep.moveTo(pos[0],pos[1])

  return false
}

// need nested state machine (or delegating)
// ideally working with async design to allow sleeping
// one idea would be to follow rust future design
// initially could poll at each tick but then could have way to
// express sensibility (specific tick or event)

// should not be linked only to creep

// creep.compute(f()).run(mv).forever(h)
// state type flow, compute==map would transform state without been a future
// futur execution nesting, mv should be able to be a future itself
// forever, until, ifthen, switch, choosebest...

// actuator (and regular operation, checks... as well as bigger orchestration?)

// more like a pipeline defined once and applicable to several creep/object/...

// state should be separated between stored state & object ref (such as creep) (or could just put ids and do always getbyid?)

// -> stored state evolution ?
//  -> may also want for debugging explicit state name?
//           or from function maybe possible? yes see https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Function/name
//          may not be unique?


/*
interface Move2FreePosInRectState {

}

export function move2FreePosInRect(creep: Creep, posTL:[number, number], posBR:[number, number]): boolean {

    // go to nearest position, if occuped, move to another one

    // this will need some state
}
*/
