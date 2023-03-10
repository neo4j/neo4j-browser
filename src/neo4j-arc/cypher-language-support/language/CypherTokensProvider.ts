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

const lexer = new CypherLexer()
export class CypherTokensProvider implements languages.TokensProvider {
  getInitialState(): CypherState {
    return new CypherState()
  }
  v = 0
  c = new CypherEditorSupport('')

  tokenize(line: string): languages.ILineTokens {
    // @ts-ignore
    this.c.update(line, this.v++)

    const items: {
      element: {
        start: { start: number; stop: number; line: number; column: number }
        stop: { start: number; stop: number; line: number; column: number }
      }
      type: CypherPart
    }[] = []

    // @ts-ignore
    this.c.applyHighlighthing((element, type: CypherPart) => {
      items.push({ element, type })
    })
    const all: any[] = []

    function traverse(element: any) {
      const c = element.getChildCount()
      if (c === 0) {
        all.push(element)

        return
      }
      for (let i = 0; i < c; i += 1) {
        traverse(element.getChild(i))
      }
    }

    // @ts-ignore
    traverse(this.c.parseTree)

    // @ts-ignore
    window.c = this.c

    console.log(
      items.map(item => ({
        scopes: item.type,
        startIndex: item.element.start.start,
        endIndex: item.element.stop.stop
      }))
    )
    console.log(items)
    const fancyTokens = items.map(item => ({
      scopes: item.type,
      startIndex: item.element.start.column,
      endIndex: item.element.stop.stop
    }))

    const basicTokens = all
      .filter(t => t.symbol !== undefined && t.symbol.type !== -1)
      .map(token => ({
        scopes: (
          CypherLexer.symbolicNames[token.symbol.type] ??
          CypherLexer.literalNames[token.symbol.type] ??
          ''
        ).toLowerCase(),
        startIndex: token.symbol.column
      }))

    const combined = basicTokens.filter(
      basic =>
        !fancyTokens.find(
          f =>
            basic.startIndex >= f.startIndex && basic.startIndex <= f.endIndex
        )
    )
    console.log(basicTokens, combined, fancyTokens)

    return {
      endState: new CypherState(),
      // @ts-ignore
      tokens: combined
        .concat(fancyTokens)
        .sort((a, b) => (a.startIndex > b.startIndex ? 1 : -1))
    }
  }
}
