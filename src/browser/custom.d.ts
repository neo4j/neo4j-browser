declare module '*.svg' {
  const content: string
  export default content
}

declare module '*.css'
declare module '*.less'
declare module 'ascii-data-table'
declare module 'react-timeago'
declare module '@neo4j/browser-lambda-parser'

interface Window {
  Cypress?: unknown
  __REDUX_DEVTOOLS_EXTENSION__?: any
}

declare module 'react-suber' {
  import { Bus } from 'suber'
  import { ComponentType } from 'react'

  interface BusProps {
    bus: Bus
  }
  
  export function withBus<P extends object>(
    comp: ComponentType<P & BusProps>
  ): ComponentType<P>
  
  export const BusProvider: ComponentType<BusProps>
}

declare module 'suber' {
  type UnsubscribeFn = () => void
  type FilterFn = (data: any) => boolean
  type MessageHandler = (message: any) => void
  type MiddlewareFunction = (_: any, source: any) => (channel: string, message: any, source: string) => void

  export interface Bus {
    take: (
      channel: string,
      fn: MessageHandler,
      filterFn?: FilterFn
    ) => UnsubscribeFn
    one: (
      channel: string,
      fn: MessageHandler,
      filterFn?: FilterFn
    ) => UnsubscribeFn
    send: (channel: string, message?: any, source?: string) => void
    self: (channel: string, message: any, fn: MessageHandler) => void
    reset: () => void
    applyMiddleware: (...args: MiddlewareFunction[]) => void
    applyReduxMiddleware: any
  }

  export function createBus(): Bus
  export function createReduxMiddleware(bus: Bus): () => (next: any) => (action: any) => any
}

declare module 'shared/services/bolt/boltWorker' {
  class WebpackWorker extends Worker {
    constructor()
  }
  export default WebpackWorker
}

declare module '*?worker' {
  const workerConstructor: {
    new (): Worker
  }
  export default workerConstructor
}

declare global {
  namespace NodeJS {
    interface Timeout extends globalThis.Timer {}
    interface ProcessEnv {
      NODE_ENV: 'development' | 'production' | 'test'
    }
  }
  interface Window {
    __REDUX_DEVTOOLS_EXTENSION__?: any
  }
}

export {}
