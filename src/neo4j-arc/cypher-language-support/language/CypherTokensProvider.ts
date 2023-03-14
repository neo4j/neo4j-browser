/*
 * Copyright (c) "Neo4j"
 * Neo4j Sweden AB [http://neo4j.com]
 *
 * This file is part of Neo4j.
 *
 * Neo4j is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */
import { CypherLexer } from '@neo4j-cypher/antlr4'
import { languages } from 'monaco-editor/esm/vs/editor/editor.api'
import { createCypherLexer } from '@neo4j-cypher/editor-support'

class CypherState implements languages.IState {
  clone() {
    return new CypherState()
  }

  equals() {
    return true
  }
}

export class CypherTokensProvider implements languages.TokensProvider {
  getInitialState(): CypherState {
    return new CypherState()
  }

  tokenize(line: string): languages.ILineTokens {
    const lexer = createCypherLexer(line) as unknown as CypherLexer

    return {
      endState: new CypherState(),
      tokens: lexer
        .getAllTokens()
        .filter(token => token !== null && token.type !== -1)
        .map(token => ({
          scopes:
            (
              CypherLexer.symbolicNames[token.type] ??
              CypherLexer.literalNames[token.type] ??
              ''
            ).toLowerCase() + '.cypher',
          startIndex: token.column
        }))
        .sort((a, b) => (a.startIndex > b.startIndex ? 1 : -1))
    }
  }
}
