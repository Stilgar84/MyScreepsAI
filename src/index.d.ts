// memory extension samples
interface CreepMemoryBase {
  //state?: string;
}

interface CarryMemory extends CreepMemoryBase {
  role: "carry"
  unload?: boolean
  tId?: string
  flagName: string
}
interface HarvesterMemory extends CreepMemoryBase {
  role: "harvester"
  transfering?: boolean
  tId?: string
  action?: string
  source?: number
}

interface StaticHarvMemory extends CreepMemoryBase {
  role: "sharvester"
  source?: number
  tId?: string
}


interface DropHarvesterMemory extends CreepMemoryBase {
  role: "dh"
  tId: string
  state?: "mv"|"h"
  pos?: [number, number]
}

interface BuilderMemory extends CreepMemoryBase {
  role: "builder"
  action?: string
  tId?: string
}

interface SetupR2Memory extends CreepMemoryBase {
  role: "setup_room2"
  building?: boolean
  action?: string
  tId?: string
}


interface UpgraderMemory extends CreepMemoryBase {
  role: "upgrader"
  state?: "mv"|"u"
  posTL?: [number, number]
  posBR?: [number, number]
  containerId?: string
}

interface DefaultCreepMemory extends CreepMemoryBase {
  role: "attack_room2" | "claim_room2"
}


// action system state
interface CreepASState {
  role: "AS"
  ca?: string // current action id
  cas?: any // current action state
  oc?: string // on complete handler id
  ocs?: any // on complete state
  // could have other handler such as on dead, on damaged ...
}

type CreepMemory = CreepASState | CarryMemory | DropHarvesterMemory | UpgraderMemory | HarvesterMemory | StaticHarvMemory | SetupR2Memory | BuilderMemory | DefaultCreepMemory


// add objects to `global` here
declare namespace NodeJS {
  interface Global {
    log: any;
  }
}

interface Memory {
  uuid: number;
  log: any;
}

declare const __REVISION__: string
