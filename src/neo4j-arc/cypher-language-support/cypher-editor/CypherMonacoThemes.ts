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
import { editor } from 'monaco-editor/esm/vs/editor/editor.api'

// colors from cypher-editor/cypher-codemirror/src/css/_solarized.css
const cypherColorFallback = {
  black: '#333333',
  blue: '#268bd2',
  cyan: '#2aa198',
  cyan_grey: '#586e75',
  green: '#859900',
  light_grey: '#93a1a1',
  magenta: '#d33682',
  orange: '#cb4b16',
  red: '#dc322f',
  violet: '#6c71c4',
  white: '#fdf6e3',
  yellow: '#b58900'
}

export type CypherColorFallback = typeof cypherColorFallback

const comments: string[] = ['comment']
const strings: string[] = ['stringliteral', 'urlhex']
const numbers: string[] = [
  'hexinteger',
  'decimalinteger',
  'octalinteger',
  'hexdigit',
  'digit',
  'nonzerodigit',
  'nonzerooctdigit',
  'octdigit',
  'zerodigit',
  'exponentdecimalreal',
  'regulardecimalreal'
]
const operators: string[] = [
  'identifierstart',
  'identifierpart',
  "';'",
  "':'",
  "'-'",
  "'=>'",
  "'://'",
  "'/'",
  "'.'",
  "'@'",
  "'#'",
  "'?'",
  "'&'",
  "'='",
  "'+'",
  "'{'",
  "','",
  "'}'",
  "'['",
  "']'",
  "'('",
  "')'",
  "'+='",
  "'|'",
  "'*'",
  "'..'",
  "'%'",
  "'^'",
  "'=~'",
  "'<>'",
  "'!='",
  "'<'",
  "'>'",
  "'<='",
  "'>='",
  "'$'",
  "'\u27E8'",
  "'\u3008'",
  "'\uFE64'",
  "'\uFF1C'",
  "'\u27E9'",
  "'\u3009'",
  "'\uFE65'",
  "'\uFF1E'",
  "'\u00AD'",
  "'\u2010'",
  "'\u2011'",
  "'\u2012'",
  "'\u2013'",
  "'\u2014'",
  "'\u2015'",
  "'\u2212'",
  "'\uFE58'",
  "'\uFE63'",
  "'\uFF0D'"
]
const keywords: string[] = [
  'access',
  'active',
  'alias',
  'admin',
  'administrator',
  'all',
  'allshortestpaths',
  'alter',
  'and',
  'any',
  'as',
  'asc',
  'ascending',
  'assert',
  'assign',
  'boosted',
  'identifier',
  'brief',
  'btree',
  'built',
  'by',
  'call',
  'case',
  'catalog',
  'change',
  'commit',
  'constraint',
  'constraints',
  'contains',
  'copy',
  'count',
  'create',
  'csv',
  'current',
  'cypher',
  'data',
  'database',
  'databases',
  'dbms',
  'default',
  'defined',
  'delete',
  'deny',
  'desc',
  'descending',
  'destroy',
  'detach',
  'distinct',
  'drop',
  'dump',
  'each',
  'element',
  'elements',
  'else',
  'encrypted',
  'end',
  'ends',
  'execute',
  'executable',
  'exist',
  'existence',
  'exists',
  'explain',
  'extract',
  'false',
  'fieldterminator',
  'filter',
  'for',
  'foreach',
  'from',
  'fulltext',
  'function',
  'functions',
  'grant',
  'graph',
  'graphs',
  'headers',
  'home',
  'if',
  'impersonate',
  'in',
  'index',
  'indexes',
  'is',
  'join',
  'key',
  'l_skip',
  'label',
  'labels',
  'limit',
  'load',
  'lookup',
  'management',
  'match',
  'merge',
  'name',
  'names',
  'new',
  'node',
  'nodes',
  'none',
  'not',
  'nowait',
  'null',
  'of',
  'on',
  'only',
  'optional',
  'options',
  'or',
  'order',
  'output',
  'password',
  'passwords',
  'periodic',
  'plaintext',
  'point',
  'populated',
  'privilege',
  'privileges',
  'procedure',
  'procedures',
  'profile',
  'property',
  'read',
  'reduce',
  'rel',
  'relationship',
  'relationships',
  'remove',
  'rename',
  'replace',
  'require',
  'required',
  'return',
  'revoke',
  'role',
  'roles',
  'scan',
  'sec',
  'second',
  'seconds',
  'seek',
  'set',
  'shortestpath',
  'show',
  'single',
  'skip',
  'start',
  'starts',
  'status',
  'stop',
  'suspended',
  'target',
  'terminate',
  'text',
  'then',
  'to',
  'transaction',
  'transactions',
  'traverse',
  'true',
  'type',
  'types',
  'union',
  'unique',
  'unwind',
  'use',
  'user',
  'users',
  'using',
  'verbose',
  'wait',
  'when',
  'where',
  'with',
  'write',
  'xor',
  'yield'
]
const labels: string[] = []
const relationshipTypes: string[] = []
const variables: string[] = []
const procedures: string[] = []
const functions: string[] = []
const parameters: string[] = []
const properties: string[] = []
const consoleCommands: string[] = []
const procedureOutput: string[] = []
const tokensWithoutSyntaxHighlighting: string[] = [
  'escapedchar',
  'unescapedsymbolicname',
  'escapedsymbolicname',
  'sp',
  'whitespace',
  'error_token'
]

export const getMonacoThemes = (
  color?: typeof cypherColorFallback
): {
  monacoDarkTheme: editor.IStandaloneThemeData
  monacoLightTheme: editor.IStandaloneThemeData
} => {
  const cypherColor = color || cypherColorFallback

  const makeCypherTokenThemeRule = (token: string, foreground: string) => ({
    token: `${token}.cypher`,
    foreground
  })

  // syntax highlighting from cypher-editor/cypher-codemirror/src/css/syntax.css
  const sharedRules: editor.ITokenThemeRule[] = [
    ...strings.map(token =>
      makeCypherTokenThemeRule(token, cypherColor.yellow)
    ),
    ...numbers.map(token => makeCypherTokenThemeRule(token, cypherColor.cyan)),

    ...keywords.map(token =>
      makeCypherTokenThemeRule(token, cypherColor.green)
    ),
    ...labels.map(token => makeCypherTokenThemeRule(token, cypherColor.orange)),
    ...relationshipTypes.map(token =>
      makeCypherTokenThemeRule(token, cypherColor.orange)
    ),
    ...variables.map(token =>
      makeCypherTokenThemeRule(token, cypherColor.blue)
    ),
    ...procedures.map(token =>
      makeCypherTokenThemeRule(token, cypherColor.violet)
    ),
    ...functions.map(token =>
      makeCypherTokenThemeRule(token, cypherColor.violet)
    ),
    ...parameters.map(token =>
      makeCypherTokenThemeRule(token, cypherColor.red)
    ),
    ...consoleCommands.map(token =>
      makeCypherTokenThemeRule(token, cypherColor.magenta)
    ),
    ...procedureOutput.map(token =>
      makeCypherTokenThemeRule(token, cypherColor.blue)
    )
  ]
  const darkThemeRules = [
    ...sharedRules,
    ...comments.map(token =>
      makeCypherTokenThemeRule(token, cypherColor.cyan_grey)
    ),
    ...properties.map(token =>
      makeCypherTokenThemeRule(token, cypherColor.light_grey)
    ),
    ...tokensWithoutSyntaxHighlighting.map(token =>
      makeCypherTokenThemeRule(token, cypherColor.white)
    ),
    ...operators.map(token =>
      makeCypherTokenThemeRule(token, cypherColor.light_grey)
    )
  ]
  const lightThemeRules = [
    ...sharedRules,
    ...comments.map(token =>
      makeCypherTokenThemeRule(token, cypherColor.light_grey)
    ),
    ...properties.map(token =>
      makeCypherTokenThemeRule(token, cypherColor.cyan_grey)
    ),
    ...tokensWithoutSyntaxHighlighting.map(token =>
      makeCypherTokenThemeRule(token, cypherColor.black)
    ),
    ...operators.map(token =>
      makeCypherTokenThemeRule(token, cypherColor.cyan_grey)
    )
  ]

  const monacoDarkTheme: editor.IStandaloneThemeData = {
    base: 'vs-dark',
    inherit: true,
    rules: darkThemeRules,
    colors: {
      'editor.background': '#121212',
      'editorCursor.foreground': '#585a61',
      'editorLineNumber.foreground': cypherColor.white,
      'editorLineNumber.activeForeground': cypherColor.white,
      foreground: cypherColor.white
    }
  }

  const monacoLightTheme: editor.IStandaloneThemeData = {
    base: 'vs',
    inherit: true,
    rules: lightThemeRules,
    colors: {
      'editor.background': '#fff',
      'editorCursor.foreground': '#d6d7db',
      'editorLineNumber.foreground': cypherColor.light_grey,
      'editorLineNumber.activeForeground': cypherColor.light_grey,
      foreground: cypherColor.black
    }
  }

  return { monacoDarkTheme, monacoLightTheme }
}
