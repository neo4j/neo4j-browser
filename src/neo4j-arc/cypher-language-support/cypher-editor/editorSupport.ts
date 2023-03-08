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
import {
  CypherEditorSupport,
  EditorSupportSchema
} from '@neo4j-cypher/editor-support'
import type { EditorSupportCompletionItem } from '@neo4j-cypher/editor-support'
import { editor, languages } from 'monaco-editor/esm/vs/editor/editor.api'

import { CypherTokensProvider } from '../language/CypherTokensProvider'
import cypherBaseFunctions from '../language/cypherBaseFunctions'
import { getMonacoThemes } from './CypherMonacoThemes'
import type { CypherColorFallback } from './CypherMonacoThemes'

export function setupAutocomplete({
  consoleCommands,
  functions = [],
  labels,
  parameters,
  procedures,
  propertyKeys,
  relationshipTypes
}: EditorSupportSchema): void {
  editorSupport.setSchema({
    consoleCommands,
    parameters,
    labels,
    relationshipTypes,
    propertyKeys,
    functions: [...cypherBaseFunctions, ...functions],
    procedures
  })
}

export function initalizeCypherSupport(
  cypherColor?: CypherColorFallback
): void {
  languages.register({ id: 'cypher' })
  languages.setTokensProvider('cypher', new CypherTokensProvider())
  languages.setLanguageConfiguration('cypher', {
    brackets: [
      ['(', ')'],
      ['{', '}'],
      ['[', ']'],
      ["'", "'"],
      ['"', '"']
    ],
    comments: {
      blockComment: ['/*', '*/'],
      lineComment: '//'
    }
  })

  languages.registerCompletionItemProvider('cypher', {
    triggerCharacters: ['.', ':', '[', '(', '{', '$'],
    provideCompletionItems: (model, position) => {
      const { startColumn, endColumn } = model.getWordUntilPosition(position)
      const range = {
        startLineNumber: position.lineNumber,
        endLineNumber: position.lineNumber,
        startColumn,
        endColumn
      }
      editorSupport.update(model.getValue())
      let items: EditorSupportCompletionItem[] = []
      // Cypher editor support repo has internal type errors
      try {
        items = editorSupport.getCompletion(
          position.lineNumber,
          position.column - 1
        ).items
      } catch {}

      const { CompletionItemKind } = languages
      const completionTypes: Record<string, languages.CompletionItemKind> = {
        keyword: CompletionItemKind.Keyword,
        label: CompletionItemKind.Field,
        relationshipType: CompletionItemKind.Reference,
        variable: CompletionItemKind.Variable,
        procedure: CompletionItemKind.Function,
        function: CompletionItemKind.Function,
        parameter: CompletionItemKind.TypeParameter,
        propertyKey: CompletionItemKind.Property,
        consoleCommand: CompletionItemKind.Function,
        consoleCommandSubcommand: CompletionItemKind.Function,
        procedureOutput: CompletionItemKind.Operator
      }

      // word preceding trigger character, used to determine range (where to insert) procedure suggestions
      const { word } = model.getWordUntilPosition({
        lineNumber: position.lineNumber,
        column: position.column - 1
      })

      const getRange = (type: string, text: string) =>
        ['consoleCommand', 'label', 'relationshipType'].includes(type)
          ? { ...range, startColumn: range.startColumn - 1 }
          : ['function', 'procedure'].includes(type)
          ? {
              ...range,
              startColumn:
                range.startColumn - (text.lastIndexOf(word) + word.length + 1)
            }
          : range

      return {
        suggestions: items.map((item, index) => {
          const label = getText(item)
          return {
            label,
            kind: completionTypes[item.type],
            insertText: label,
            range: getRange(item.type, label),
            detail: item.postfix || undefined,
            sortText: encodeNumberAsSortableString(index)
          }
        })
      }
    }
  })

  const { monacoDarkTheme, monacoLightTheme } = getMonacoThemes(cypherColor)

  editor.defineTheme('dark', monacoDarkTheme)
  editor.defineTheme('light', monacoLightTheme)
  editor.setTheme('light')
}

function encodeNumberAsSortableString(number: number): string {
  // use letter prefix to encode numbers. breaks after numbers are have more than ~28 digits
  // Monaco by default sorts its suggestion by label text. But our language support sorts
  // after relevance first and then alphabetically.
  const A_CHAR = 65
  const prefix = String.fromCharCode(A_CHAR + number.toString().length)
  return `${prefix}${number}`
}

const editorSupport = new CypherEditorSupport('')
// CypherEditorSupport returns the content attributes of procedures with dots wrapped in backticks, e.g. "`apoc.coll.avg`"
// This function strips any surrounding backticks before we use the .content value in the completion item provider
const stripSurroundingBackticks = (str: string) =>
  str.charAt(0) === '`' && str.charAt(str.length - 1) === '`'
    ? str.substr(1, str.length - 2)
    : str

export const getText = (item: EditorSupportCompletionItem): string =>
  ['function', 'procedure'].includes(item.type)
    ? stripSurroundingBackticks(item.content)
    : item.content

export function setEditorTheme(
  theme: 'normal' | 'dark' | 'light' | 'outline'
): void {
  editor.setTheme(theme === 'dark' ? 'dark' : 'light')
}
