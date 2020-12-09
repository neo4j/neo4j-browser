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

import { editor } from 'monaco-editor/esm/vs/editor/editor.api'
import { base, dark } from 'browser-styles/themes'
import {
  LIGHT_THEME,
  OUTLINE_THEME,
  DARK_THEME
} from 'shared/modules/settings/settingsDuck'

export type BrowserTheme =
  | typeof LIGHT_THEME
  | typeof OUTLINE_THEME
  | typeof DARK_THEME

// colors from cypher-editor/cypher-codemirror/src/css/_solarized.css
const enum CypherColor {
  black = '#333333',
  blue = '#268bd2',
  cyan = '#2aa198',
  cyan_grey = '#586e75',
  green = '#859900',
  light_grey = '#93a1a1',
  magenta = '#d33682',
  orange = '#cb4b16',
  red = '#dc322f',
  violet = '#6c71c4',
  white = '#fdf6e3',
  yellow = '#b58900'
}

const makeCypherTokenThemeRule = (token: string, foreground: CypherColor) => ({
  token: `${token}.cypher`,
  foreground
})

const comments: string[] = ['comment']
const strings: string[] = ['stringliteral', 'urlhex']
const numbers: string[] = [
  'hexinteger',
  'decimalinteger',
  'octalinteger',
  'hexletter',
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
  'brief',
  'btree',
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
  'database',
  'databases',
  'dbms',
  'default',
  'defined',
  'delete',
  'deny',
  'desc',
  'descending',
  'detach',
  'distinct',
  'drop',
  'element',
  'elements',
  'else',
  'end',
  'ends',
  'execute',
  'exist',
  'exists',
  'explain',
  'extract',
  'false',
  'fieldterminator',
  'filter',
  'for',
  'foreach',
  'from',
  'function',
  'functions',
  'grant',
  'graph',
  'graphs',
  'headers',
  'if',
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
  'null',
  'of',
  'on',
  'optional',
  'options',
  'or',
  'order',
  'output',
  'password',
  'periodic',
  'populated',
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
  'replace',
  'required',
  'return',
  'revoke',
  'role',
  'roles',
  'scan',
  'set',
  'shortestpath',
  'show',
  'single',
  'start',
  'starts',
  'status',
  'stop',
  'suspended',
  'then',
  'to',
  'traverse',
  'true',
  'type',
  'types',
  'union',
  'unique',
  'unwind',
  'user',
  'users',
  'using',
  'verbose',
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

// syntax highlighting from cypher-editor/cypher-codemirror/src/css/syntax.css
const sharedRules: editor.ITokenThemeRule[] = [
  ...strings.map(token => makeCypherTokenThemeRule(token, CypherColor.yellow)),
  ...numbers.map(token => makeCypherTokenThemeRule(token, CypherColor.cyan)),

  ...keywords.map(token => makeCypherTokenThemeRule(token, CypherColor.green)),
  ...labels.map(token => makeCypherTokenThemeRule(token, CypherColor.orange)),
  ...relationshipTypes.map(token =>
    makeCypherTokenThemeRule(token, CypherColor.orange)
  ),
  ...variables.map(token => makeCypherTokenThemeRule(token, CypherColor.blue)),
  ...procedures.map(token =>
    makeCypherTokenThemeRule(token, CypherColor.violet)
  ),
  ...functions.map(token =>
    makeCypherTokenThemeRule(token, CypherColor.violet)
  ),
  ...parameters.map(token => makeCypherTokenThemeRule(token, CypherColor.red)),
  ...consoleCommands.map(token =>
    makeCypherTokenThemeRule(token, CypherColor.magenta)
  ),
  ...procedureOutput.map(token =>
    makeCypherTokenThemeRule(token, CypherColor.blue)
  )
]
const darkThemeRules = [
  ...sharedRules,
  ...comments.map(token =>
    makeCypherTokenThemeRule(token, CypherColor.cyan_grey)
  ),
  ...properties.map(token =>
    makeCypherTokenThemeRule(token, CypherColor.light_grey)
  ),
  ...tokensWithoutSyntaxHighlighting.map(token =>
    makeCypherTokenThemeRule(token, CypherColor.white)
  ),
  ...operators.map(token =>
    makeCypherTokenThemeRule(token, CypherColor.light_grey)
  )
]
const lightThemeRules = [
  ...sharedRules,
  ...comments.map(token =>
    makeCypherTokenThemeRule(token, CypherColor.light_grey)
  ),
  ...properties.map(token =>
    makeCypherTokenThemeRule(token, CypherColor.cyan_grey)
  ),
  ...tokensWithoutSyntaxHighlighting.map(token =>
    makeCypherTokenThemeRule(token, CypherColor.black)
  ),
  ...operators.map(token =>
    makeCypherTokenThemeRule(token, CypherColor.cyan_grey)
  )
]

export const monacoDarkTheme: editor.IStandaloneThemeData = {
  base: 'vs-dark',
  inherit: true,
  rules: darkThemeRules,
  colors: {
    'editor.background': dark.frameCommandBackground,
    'editorCursor.foreground': '#585a61',
    'editorLineNumber.foreground': CypherColor.white,
    foreground: CypherColor.white
  }
}
export const monacoLightTheme: editor.IStandaloneThemeData = {
  base: 'vs',
  inherit: true,
  rules: lightThemeRules,
  colors: {
    'editor.background': base.frameCommandBackground,
    'editorCursor.foreground': '#d6d7db',
    'editorLineNumber.foreground': CypherColor.light_grey,
    foreground: CypherColor.black
  }
}
