declare module 'suber' {
  export interface Bus {
    take: (channel: string, fn: (message: any) => void, filterFn?: (data: any) => boolean) => () => void
    one: (channel: string, fn: (message: any) => void, filterFn?: (data: any) => boolean) => () => void
    send: (channel: string, message?: any, source?: string) => void
    self: (channel: string, message: any, fn: (message: any) => void) => void
    reset: () => void
    applyMiddleware: (...args: any[]) => void
    applyReduxMiddleware: any
  }

  export function createBus(): Bus
  export function createReduxMiddleware(bus: Bus): () => (next: any) => (action: any) => any
}

declare module 'react-suber' {
  import { Bus } from 'suber'
  import { ComponentType } from 'react'
  
  export interface BusProps { bus: Bus }
  export function withBus<P extends object>(comp: ComponentType<P & BusProps>): ComponentType<P>
  export const BusProvider: ComponentType<BusProps>
} 