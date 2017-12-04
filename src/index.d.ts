// memory extension samples
interface CreepMemoryBase {
  state?: string;
}

interface CarryMemory extends CreepMemoryBase {
  role: "carry"
  unload?: boolean
  tId?: string
  flagName?: string
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

interface DefaultCreepMemory extends CreepMemoryBase {
  role: "upgrader" | "attack_room2" | "claim_room2"
}


type CreepMemory = CarryMemory | HarvesterMemory | StaticHarvMemory | SetupR2Memory | BuilderMemory | DefaultCreepMemory


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
