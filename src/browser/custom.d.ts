declare module '*.svg' {
  const content: string
  export default content
}

declare module '*.css'
declare module '*.less'
declare module '@mdx-js/runtime'
declare module '@literal-jsx/parser'
declare module 'ascii-data-table'
declare module 'react-timeago'
declare module '@neo4j/browser-lambda-parser'

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
    send: (channel: string, message: any, source?: string) => void
    self: (channel: string, message: any, fn: MessageHandler) => void
    reset: () => void
    applyMiddleware: (...args: ((_: never, source: object) => void)[]) => void
    applyReduxMiddleware: any
  }

  const createBus: () => Bus
  const createReduxMiddleware: (bus: Bus) => () => (next) => (action) => action

  export { Bus, createBus, createReduxMiddleware }
}

declare module 'cypher-editor-support/src/_generated/CypherLexer' {
  export class CypherLexer extends (await import('antlr4/index.js')).Lexer {
    constructor(input: unknown)
    channelNames: string[]
    modeNames: string[]
    literalNames: string[]
    symbolicNames: string[]
    ruleNames: string[]
    grammarFileName: string;
    [key: string]: number
  }
}

declare module 'cypher-editor-support' {
  interface EditorSupportPosition {
    line: number
    column: number
  }

  interface EditorSupportCompletionItem {
    type: string
    view: string
    content: string
    postfix: null
  }

  interface ConsoleCommand {
    name: string
    description?: string
    commands?: ConsoleCommand[]
  }

  interface EditorSupportSchema {
    labels?: string[]
    relationshipTypes?: string[]
    propertyKeys?: string[]
    functions?: string[]
    procedures?: string[]
    consoleCommands?: ConsoleCommand[]
    parameters?: string[]
  }

  export class CypherEditorSupport {
    constructor(input: string)
    getCompletion(
      line: number,
      column: number,
      doFilter?: boolean
    ): {
      from: EditorSupportPosition
      to: EditorSupportPosition
      items: EditorSupportCompletionItem[]
    }
    setSchema(schema: EditorSupportSchema): void
    update(input: string): void
  }
  export function parse(
    input: string
  ): {
    referencesListener: {
      queriesAndCommands: { getText: () => string; start: { line: number } }[]
    }
  }
  export function extractStatements(
    input: string
  ): {
    referencesListener: { statements: [{ raw: () => {}[] }] }
  }
}

declare module 'neo4j-driver' {
  const { auth, driver, int, isInt, session } = await import('neo4j-driver')
  // overwrite types export to silence type warnings
  const types: any
  export { auth, driver, int, isInt, session, types }
}
