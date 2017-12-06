
// See if can put in place cpu optim of putting creep to sleep (async prog with sleep)
export function move2Pos(creep: Creep, pos:[number, number]): boolean {
  if(creep.pos.x==pos[0] && creep.pos.y==pos[1])
      return true

  if(creep.fatigue==0)
      creep.moveTo(pos[0],pos[1])

  return false
}
