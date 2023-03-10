declare module 'monaco-editor/esm/vs/base/parts/quickinput/browser/quickInputList' {
  export class QuickInputList {
    layout: (maxHeight: number) => void
    list: {
      getHTMLElement: () => HTMLElement
      layout: () => void
    }
  }
}

declare module '@neo4j-cypher/extract-statements' {
  export function extractStatements(query: string): any
}

declare module '@neo4j-cypher/antlr4' {
  export class CypherLexer {
    getAllTokens: () => { type: number; column: number }[]
    static symbolicNames: Record<string, string>
    static literalNames: Record<string, string>
  }
  export class Lexer {}
}
