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
import { CypherEditorSupport } from '@neo4j-cypher/editor-support'
// @ts-ignore
import { CypherLexer } from '@neo4j-cypher/antlr4'
import { languages } from 'monaco-editor/esm/vs/editor/editor.api'

class CypherState implements languages.IState {
  clone() {
    return new CypherState()
  }

  equals() {
    return true
  }
}

// TODO type export was from wrong folder
export type CypherPart =
  | 'label'
  | 'variable'
  | 'relationshipType'
  | 'property'
  | 'procedure'
  | 'procedureOutput'
  | 'function'
  | 'function'
  | 'parameter'
  | 'consoleCommand'
  | 'property'

export class CypherTokensProvider implements languages.TokensProvider {
  getInitialState(): CypherState {
    return new CypherState()
  }
  v = 0
  c = new CypherEditorSupport('')

  tokenize(line: string): languages.ILineTokens {
    // @ts-ignore
    this.c.update(line, this.v++)

    const items: languages.IToken[] = []

    // @ts-ignore
    this.c.applyHighlighthing((element: any, type: CypherPart) => {
      element.colorType = type
      items.push({
        scopes: type.toLowerCase(),
        startIndex: element.start.column
      })
    })

    function traverse(element: any) {
      if (element.colorType) return

      const c = element.getChildCount()
      if (c === 0) {
        if (element.symbol !== undefined && element.symbol.type !== -1) {
          items.push({
            scopes: (
              CypherLexer.symbolicNames[element.symbol.type] ??
              CypherLexer.literalNames[element.symbol.type] ??
              ''
            ).toLowerCase(),
            startIndex: element.symbol.column
          })
        }
        return
      }

      for (let i = 0; i < c; i += 1) {
        traverse(element.getChild(i))
      }
    }

    // @ts-ignore
    traverse(this.c.parseTree)

    return {
      endState: new CypherState(),
      tokens: items.sort((a, b) => (a.startIndex > b.startIndex ? 1 : -1))
    }
  }
}
