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
}

declare module 'react-suber' {
  interface BusProps {
    bus: Bus
  }
  const withBus: (
    comp: React.ComponentType<P>
  ) => React.ComponentType<P & BusProps>
  const BusProvider: React.ComponentType<BusProps>
  export { withBus, BusProvider, BusProps }
}

declare module 'suber' {
  type UnsubscribeFn = () => void
  type FilterFn = (data: any) => boolean
  type MessageHandler = (message: any) => void

  interface Bus {
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
    applyMiddleware: (...args: ((_: never, source: object) => void)[]) => void
    applyReduxMiddleware: any
  }

  const createBus: () => Bus
  const createReduxMiddleware: (bus: Bus) => () => (next) => (action) => action

  export { Bus, createBus, createReduxMiddleware }
}

declare module 'shared/services/bolt/boltWorker' {
  class WebpackWorker extends Worker {
    constructor()
  }

  export default WebpackWorker
}
