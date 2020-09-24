declare module '*.svg' {
  const content: string
  export default content
}

declare module 'react-suber' {
  interface BusProps {
    bus: Bus
  }
  const withBus: (
    comp: React.ComponentType<P>
  ) => React.ComponentType<P & BusProps>
  const BusProvider: React.ComponentType
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
    send: (channel: string, message: any, source?: string) => void
    self: (channel: string, message: any, fn: MessageHandler) => void
    reset: () => void
  }

  const createBus: () => Bus
  export { Bus, createBus }
}
