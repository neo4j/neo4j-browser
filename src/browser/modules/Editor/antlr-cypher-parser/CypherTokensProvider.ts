import * as monaco from 'monaco-editor'
import { createLexer } from './ParserFacade'
import ILineTokens = monaco.languages.ILineTokens
import IToken = monaco.languages.IToken

export class CypherState implements monaco.languages.IState {
  clone(): monaco.languages.IState {
    return new CypherState()
  }

  equals(): boolean {
    return true
  }
}

export class CypherTokensProvider implements monaco.languages.TokensProvider {
  getInitialState(): monaco.languages.IState {
    return new CypherState()
  }

  tokenize(line: string): monaco.languages.ILineTokens {
    // So far we ignore the state, which is not great for performance reasons
    return tokensForLine(line)
  }
}

const EOF = -1

class CypherToken implements IToken {
  scopes: string
  startIndex: number

  constructor(ruleName: string, startIndex: number) {
    if (ruleName === null) {
      ruleName = ''
    }
    this.scopes = ruleName.toLowerCase() + '.cypher'
    this.startIndex = startIndex
  }
}

class CypherLineTokens implements ILineTokens {
  endState: monaco.languages.IState
  tokens: monaco.languages.IToken[]

  constructor(tokens: monaco.languages.IToken[]) {
    this.endState = new CypherState()
    this.tokens = tokens
  }
}

export function tokensForLine(input: string): monaco.languages.ILineTokens {
  const errorStartingPoints: number[] = []

  // class ErrorCollectorListener extends error.ErrorListener {
  //     syntaxError(_recognizer, _offendingSymbol, _line, column, _msg, _e) {
  //         errorStartingPoints.push(column)
  //     }
  // }

  const lexer = createLexer(input)
  lexer.removeErrorListeners()
  // let errorListener = new ErrorCollectorListener();
  // lexer.addErrorListener(errorListener);
  let done = false
  const myTokens: monaco.languages.IToken[] = []
  do {
    const token = lexer.nextToken()
    if (token == null) {
      done = true
    } else {
      // We exclude EOF
      if (token.type == EOF) {
        done = true
      } else {
        let tokenTypeName = lexer.symbolicNames[token.type]
        if (tokenTypeName === null) {
          tokenTypeName = lexer.literalNames[token.type]
        }
        const myToken = new CypherToken(tokenTypeName, token.column)
        myTokens.push(myToken)
      }
    }
  } while (!done)

  // Add all errors
  for (const e of errorStartingPoints) {
    myTokens.push(new CypherToken('error.cypher', e))
  }
  myTokens.sort((a, b) => (a.startIndex > b.startIndex ? 1 : -1))

  return new CypherLineTokens(myTokens)
}
