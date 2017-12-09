
import {log} from '../../lib/logger/log'

export type CreepActionReturn<S,R> = { r: "o", s: S } | { r: "n", s: any, a: string } | { r: "c", v: R}

interface CreepAction<S,R> {
  // return new state (can also do in place change but shoudl still return it)
  // can also return a new action for next poll/tick (used for easy chaining or upgrading the action to a new version)
  // or result of the action if completed (used for going back a level)
  run(c: Creep, state: S): CreepActionReturn<S,R>
}

type CreepActionGeneric = CreepAction<any,any>

export namespace CreepActionRegistry {
  let actionRegistry: { [id: string]: CreepActionGeneric } = {}
  export function register(id: string, action: CreepActionGeneric) {
    if(actionRegistry[id]) {
      log.error("Duplicate Creep action registration:", id)
    } else {
      actionRegistry[id] = action
      log.debug("Creep action registered:", id)
    }
  }
  export function get(id: string): CreepActionGeneric { return actionRegistry[id] }
}

// event handler (can also be action transition)
interface CreepHandler {
  run(c: Creep, args: any): any
}
/*
interface CreepOnCompleteHandler extends CreepHandler {
  run(c: Creep, args: any): {}
}
*/


export namespace CreepHandlerRegistry {
  let handlerRegistry: { [id: string]: CreepHandler } = {}
  export function register(id: string, handler: CreepHandler) {
    if(handlerRegistry[id]) {
      log.error("Duplicate Creep handler registration:", id)
    } else {
      handlerRegistry[id] = handler
      log.debug("Creep handler registered:", id)
    }
  }
  export function get(id: string): CreepHandler { return handlerRegistry[id] }
}


export function runCreep(c: Creep, mem: CreepASState) {
  while(true) {
    if(mem.ca) {
      const res = CreepActionRegistry.get(mem.ca).run(c, mem.cas)
      if(res.r=="o") {
        mem.cas = res.s
        return
      } else if(res.r=="n") {
        mem.ca = res.a
        mem.cas = res.s
        return
      } else {
        mem.ca = undefined
        mem.cas = undefined
      }
    }
    // only go there if current action completed
    if(mem.oc) {
      const res = CreepHandlerRegistry.get(mem.oc).run(c, mem.ocs)
      mem.ca = res.ca
      mem.cas = res.cas
      mem.oc = res.oc
      mem.ocs = res.ocs
    }
    if(!mem.ca) {
      log.debug("Creep with nothing to do:", c.name)
      // TODO put a do nothing action (which may use say to do some visible stuff :))
      return
    }
  }
}
