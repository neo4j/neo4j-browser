/*
 * Copyright (c) 2002-2020 "Neo4j,"
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

import { parse } from 'cypher-editor-support'
import * as monaco from 'monaco-editor'
import React, { useEffect, useRef } from 'react'
import { withBus } from 'react-suber'
import { Bus } from 'suber'
import { NEO4J_BROWSER_USER_ACTION_QUERY } from 'services/bolt/txMetadata'
import { CYPHER_REQUEST } from 'shared/modules/cypher/cypherDuck'
import { CypherTokensProvider } from './antlr-cypher-parser/CypherTokensProvider'
import { shouldCheckForHints } from './Editor'

export const VS_LIGHT_THEME = 'vs'
export const VS_DARK_THEME = 'vs-dark'
export const VS_HIGH_CONTRAST_THEME = 'hc-black'

export type VSTheme =
  | typeof VS_LIGHT_THEME
  | typeof VS_DARK_THEME
  | typeof VS_HIGH_CONTRAST_THEME

interface MonacoProps {
  bus: Bus
  id: string
  value?: string
  onChange?: (value: string) => void
  options?: monaco.editor.IGlobalEditorOptions
  theme?: VSTheme
}

const Monaco = ({
  bus,
  id,
  value = '',
  onChange = () => undefined,
  theme = VS_LIGHT_THEME
}: MonacoProps): JSX.Element => {
  const editorRef = useRef<monaco.editor.IStandaloneCodeEditor | null>(null)
  const monacoId = `monaco-${id}`

  useEffect(() => {
    monaco.languages.register({ id: 'cypher' })
    monaco.languages.setTokensProvider('cypher', new CypherTokensProvider())

    // colors from cypher-editor/cypher-codemirror/src/css/_solarized.css
    const enum Color {
      blue = '#268bd2',
      cyan = '#2aa198',
      cyan_grey = '#586e75',
      green = '#859900',
      light_grey = '#93a1a1',
      magenta = '#d33682',
      orange = '#cb4b16',
      red = '#dc322f',
      violet = '#6c71c4',
      yellow = '#b58900'
    }

    // syntax highlighting from cypher-editor/cypher-codemirror/src/css/syntax.css
    const rules = [
      // { token: 'p-label', foreGround: Color.orange },
      // { token: 'p-relationshipType', foreGround: Color.orange },
      // { token: 'p-variable', foreGround: Color.blue },
      // { token: 'p-procedure', foreGround: Color.violet },
      // { token: 'p-function', foreGround: Color.violet },
      // {
      //   token: 'p-parameter',
      //   foreGround: Color.red
      // },
      // { token: 'p-property', foreGround: Color.cyan_grey },
      // {
      //   token: 's-cypher s-cypher-dark  p-property',
      //   foreGround: Color.light_grey
      // },
      // { token: 'p-consoleCommand', foreGround: Color.magenta },
      // { token: 'p-procedureOutput', foreGround: Color.blue },

      ...[
        'all',
        'allshortestpaths',
        'and',
        'any',
        'as',
        'asc',
        'ascending',
        'assert',
        'by',
        'call',
        'case',
        'commit',
        'constraint',
        'contains',
        'count',
        'create',
        'csv',
        'cypher',
        'delete',
        'desc',
        'descending',
        'detach',
        'distinct',
        'drop',
        'else',
        'end',
        'ends',
        'enterrule',
        'exists',
        'exitrule',
        'explain',
        'extract',
        'false',
        'fieldterminator',
        'filter',
        'foreach',
        'from',
        'headers',
        'in',
        'index',
        'is',
        'join',
        'key',
        'l_skip',
        'limit',
        'load',
        'match',
        'merge',
        'node',
        'none',
        'not',
        'null',
        'on',
        'optional',
        'or',
        'order',
        'periodic',
        'profile',
        'reduce',
        'rel',
        'relationship',
        'remove',
        'return',
        'scan',
        'set',
        'shortestpath',
        'single',
        'start',
        'starts',
        'then',
        'true',
        'union',
        'unique',
        'unwind',
        'using',
        'when',
        'where',
        'with',
        'xor',
        'yield'
      ].map((keyword: string) => ({
        token: `${keyword}.cypher`,
        foreground: Color.green
      })),
      ...['regulardecimalreal.cypher', 'decimalinteger.cypher'].map(token => ({
        token,
        foreground: Color.cyan
      })),
      { token: 'stringliteral.cypher', foreground: Color.yellow }
    ]

    monaco.editor.defineTheme(VS_LIGHT_THEME, {
      base: VS_LIGHT_THEME,
      inherit: false,
      rules: [...rules, { token: 'sp.cypher', foreground: Color.light_grey }],
      colors: {}
    })
    monaco.editor.defineTheme(VS_DARK_THEME, {
      base: VS_DARK_THEME,
      inherit: false,
      rules: [...rules, { token: 'sp.cypher', foreground: Color.cyan_grey }],
      colors: {}
    })

    editorRef.current = monaco.editor.create(
      document.getElementById(monacoId) as HTMLElement,
      {
        automaticLayout: true,
        contextmenu: false,
        cursorStyle: 'block',
        fontSize: 16,
        language: 'cypher',
        lightbulb: { enabled: false },
        links: false,
        minimap: { enabled: false },
        scrollBeyondLastColumn: 0,
        scrollBeyondLastLine: false,
        theme: VS_LIGHT_THEME,
        value,
        wordWrap: 'on'
      }
    )

    updateCode()

    editorRef.current?.onDidChangeModelContent(updateCode)

    return () => {
      editorRef.current?.dispose()
    }
  }, [])

  useEffect(() => {
    monaco.editor.setTheme(theme)
  }, [theme])

  const updateCode = () => {
    const text =
      editorRef.current
        ?.getModel()
        ?.getLinesContent()
        .join('\n') || ''

    const { queriesAndCommands } = parse(text).referencesListener
    onChange(text)
    checkForHints(queriesAndCommands)
  }

  const checkForHints = (
    statements: { start: { line: number }; getText: () => string }[]
  ) => {
    if (!statements.length) return
    statements.forEach(stmt => {
      const text = stmt.getText()
      if (!shouldCheckForHints(text)) {
        return
      }
      const statementLineNumber = stmt.start.line - 1

      bus.self(
        CYPHER_REQUEST,
        {
          query: 'EXPLAIN ' + text,
          queryType: NEO4J_BROWSER_USER_ACTION_QUERY
        },
        response => {
          if (
            response.success === true &&
            response.result.summary.notifications.length > 0
          ) {
            monaco.editor.setModelMarkers(
              editorRef.current?.getModel() as monaco.editor.ITextModel,
              monacoId,
              response.result.summary.notifications.map(
                ({
                  position: { line },
                  title
                }: {
                  position: { line: number }
                  title: string
                }) => ({
                  startLineNumber: statementLineNumber + line,
                  startColumn: 1,
                  endLineNumber: statementLineNumber + line,
                  endColumn: 1000,
                  message: title,
                  severity: monaco.MarkerSeverity.Warning
                })
              )
            )
          }
        }
      )
    })
  }

  return (
    <div
      id={monacoId}
      style={{
        overflow: 'hidden',
        width: '100%'
      }}
    />
  )
}

export default withBus(Monaco)
