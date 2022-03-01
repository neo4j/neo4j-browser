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

  export interface ConsoleCommand {
    name: string
    description?: string
    commands?: ConsoleCommand[]
  }

  interface FunctionSchema {
    name: string
    signature: string
  }

  interface ProcedureSchema {
    name: string
    signature: string
    returnItems: FunctionSchema[]
  }

  export interface EditorSupportSchema {
    labels?: string[]
    relationshipTypes?: string[]
    propertyKeys?: string[]
    functions?: FunctionSchema[]
    procedures?: ProcedureSchema[]
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
  interface CypherPosition {
    column: number
    line: number
  }
  export interface QueryOrCommand {
    getText: () => string
    start: CypherPosition
    stop: CypherPosition
  }
  export function parse(input: string): {
    referencesListener: {
      queriesAndCommands: QueryOrCommand[]
    }
  }
  export function extractStatements(input: string): {
    referencesListener: {
      statements: [{ raw: () => Record<string, unknown>[] }]
    }
  }
}

declare module 'monaco-editor/esm/vs/base/parts/quickinput/browser/quickInputList' {
  export class QuickInputList {
    layout: (maxHeight: number) => void
    list: {
      getHTMLElement: () => HTMLElement
      layout: () => void
    }
  }
}
