import {
  CommonTokenStream,
  InputStream,
  Token,
  // error,
  // Parser,
  Lexer
} from 'antlr4/index.js'
// import { DefaultErrorStrategy } from 'antlr4/error/ErrorStrategy.js'

import { CypherLexer } from 'cypher-editor-support/src/_generated/CypherLexer'
import { CypherParser } from 'cypher-editor-support/src/_generated/CypherParser'

// class ConsoleErrorListener extends error.ErrorListener {
//   syntaxError(_recognizer: any, _offendingSymbol: any, _line: any, _column: any, msg: string) {
//     console.log('ERROR ' + msg)
//   }
// }

export class Error {
  startLine: number
  endLine: number
  startCol: number
  endCol: number
  message: string

  constructor(
    startLine: number,
    endLine: number,
    startCol: number,
    endCol: number,
    message: string
  ) {
    this.startLine = startLine
    this.endLine = endLine
    this.startCol = startCol
    this.endCol = endCol
    this.message = message
  }
}

// class CollectorErrorListener extends error.ErrorListener {
//   private errors: Error[] = []

//   constructor(errors: Error[]) {
//     super()
//     this.errors = errors
//   }

//   syntaxError(_recognizer: any, offendingSymbol: { _text: string | any[] | null }, line: number, column: number, msg: string) {
//     let endColumn = column + 1
//     if (offendingSymbol._text !== null) {
//       endColumn = column + offendingSymbol._text.length
//     }
//     this.errors.push(new Error(line, line, column, endColumn, msg))
//   }
// }

export function createLexer(input: string): CypherLexer {
  const chars = new InputStream(input)
  const lexer = new CypherLexer(chars)

  // lexer.strictMode = false

  return lexer
}

export function getTokens(input: string): Token[] {
  return createLexer(input).getAllTokens()
}

// function createParser(input: string) {
//   const lexer = createLexer(input)

//   return createParserFromLexer(lexer)
// }

function createParserFromLexer(lexer: Lexer) {
  const tokens = new CommonTokenStream(lexer)
  return new CypherParser(tokens)
}

// function parseTree(input: any) {
//   const parser = createParser(input)

//   return parser.compilationUnit()
// }

// export function parseTreeStr(input: string) {
//   const lexer = createLexer(input)
//   lexer.removeErrorListeners()
//   lexer.addErrorListener(new ConsoleErrorListener())

//   const parser = createParserFromLexer(lexer as any)
//   parser.removeErrorListeners()
//   parser.addErrorListener(new ConsoleErrorListener())

//   const tree = parser.compilationUnit()

//   return tree.tostringTree(parser.ruleNames)
// }

// class CypherErrorStrategy extends DefaultErrorStrategy {
//   reportUnwantedToken(recognizer: Parser) {
//     return super.reportUnwantedToken(recognizer)
//   }

//   singleTokenDeletion(recognizer: Parser) {
//     const nextTokenType = recognizer.getTokenStream().LA(2)
//     if (recognizer.getTokenStream().LA(1) == CypherParser.NL) {
//       return null
//     }
//     const expecting = this.getExpectedTokens(recognizer)
//     if (expecting.contains(nextTokenType)) {
//       this.reportUnwantedToken(recognizer)
//       recognizer.consume() // simply delete extra token
//       // we want to return the token we're actually matching
//       const matchedSymbol = recognizer.getCurrentToken()
//       this.reportMatch(recognizer) // we know current token is correct
//       return matchedSymbol
//     } else {
//       return null
//     }
//   }
//   getExpectedTokens = function(recognizer: { getExpectedTokens: () => any }) {
//     return recognizer.getExpectedTokens()
//   }

//   reportMatch = function(recognizer: any) {
//     this.endErrorCondition(recognizer)
//   }
// }

export function validate(input: string): Error[] {
  const errors: Error[] = []

  const lexer = createLexer(input)
  lexer.removeErrorListeners()
  // lexer.addErrorListener(new ConsoleErrorListener())

  const parser = createParserFromLexer(lexer as any)
  parser.removeErrorListeners()
  // parser.addErrorListener(new CollectorErrorListener(errors))
  // parser._errHandler = new CypherErrorStrategy()

  // parser.compilationUnit()
  return errors
}
