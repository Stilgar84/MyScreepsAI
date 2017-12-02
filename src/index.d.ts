// memory extension samples
interface CreepMemory {
  role: string;
}


interface CarryMemory extends CreepMemory {
  unload?: boolean
  tId?: string
  flagName?: string
}

interface StaticHarvMemory extends CreepMemory {
  source?: number
  tId?: string
}

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
