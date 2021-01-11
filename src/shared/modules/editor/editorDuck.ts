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

import { CypherEditorSupport } from 'cypher-editor-support'
import { editor, languages } from 'monaco-editor'
import { Action, Store } from 'redux'
import { ActionsObservable, Epic } from 'redux-observable'
import Rx from 'rxjs/Rx'

import {
  monacoDarkTheme,
  monacoLightTheme
} from 'browser/modules/Editor/CypherMonacoThemes'
import { CypherTokensProvider } from 'browser/modules/Editor/CypherTokensProvider'
import cypherFunctions from 'browser/modules/Editor/cypher/functions'
import consoleCommands from 'browser/modules/Editor/language/consoleCommands'
import { getUrlParamValue } from 'services/utils'
import { APP_START, URL_ARGUMENTS_CHANGE } from 'shared/modules/app/appDuck'
import {
  commandSources,
  executeCommand
} from 'shared/modules/commands/commandsDuck'
import {
  DARK_THEME,
  DISABLE_IMPLICIT_INIT_COMMANDS,
  LIGHT_THEME,
  OUTLINE_THEME
} from 'shared/modules/settings/settingsDuck'
import {
  toFunction,
  toLabel,
  toProcedure,
  toPropertyKey,
  toRelationshipType
} from 'browser/modules/Editor/editorSchemaConverter'

const NAME = 'editor'
export const SET_CONTENT = `${NAME}/SET_CONTENT`
export const EDIT_CONTENT = `${NAME}/EDIT_CONTENT`
export const FOCUS = `${NAME}/FOCUS`
export const EXPAND = `${NAME}/EXPAND`
export const NOT_SUPPORTED_URL_PARAM_COMMAND = `${NAME}/NOT_SUPPORTED_URL_PARAM_COMMAND`

// Supported commands
const validCommandTypes: any = {
  play: (args: any) => `:play ${args.join(' ')}`,
  edit: (args: any) => args.join('\n'),
  param: (args: any) => `:param ${args.join(' ')}`,
  params: (args: any) => `:params ${args.join(' ')}`
}

export const setContent = (newContent: any) => ({
  type: SET_CONTENT,
  message: newContent
})
export const editContent = (
  id: any,
  message: any,
  {
    directory = null,
    name = null,
    isStatic = false,
    isProjectFile = false
  }: any = {}
) => ({
  type: EDIT_CONTENT,
  message,
  id,
  isProjectFile,
  isStatic,
  name,
  directory
})

export const populateEditorFromUrlEpic = (some$: any, _store: any) => {
  return some$
    .ofType(APP_START)
    .merge(some$.ofType(URL_ARGUMENTS_CHANGE))
    .delay(1) // Timing issue. Needs to be detached like this
    .mergeMap((action: any) => {
      if (!action.url) {
        return Rx.Observable.never()
      }
      const cmdParam = getUrlParamValue('cmd', action.url)

      // No URL command param found
      if (!cmdParam || !cmdParam[0]) {
        return Rx.Observable.never()
      }

      // Not supported URL param command
      if (!Object.keys(validCommandTypes).includes(cmdParam[0])) {
        return Rx.Observable.of({
          type: NOT_SUPPORTED_URL_PARAM_COMMAND,
          command: cmdParam[0]
        })
      }

      const commandType = cmdParam[0]
      // Credits to https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/decodeURIComponent
      // for the "decodeURIComponent cannot be used directly to parse query parameters"
      const cmdArgs =
        getUrlParamValue(
          'arg',
          decodeURIComponent(action.url.replace(/\+/g, ' '))
        ) || []
      const fullCommand = validCommandTypes[commandType](cmdArgs)

      // Play command is considered safe and can run automatically
      // When running the explicit command, also set flag to skip any implicit init commands
      if (commandType === 'play') {
        return [
          executeCommand(fullCommand, { source: commandSources.url }),
          { type: DISABLE_IMPLICIT_INIT_COMMANDS }
        ]
      }

      return Rx.Observable.of(setContent(fullCommand))
    })
}

const editorSupport = new CypherEditorSupport('')

export const initializeCypherEditorEpic = (
  actions$: ActionsObservable<{ type: typeof APP_START }>
) => {
  return actions$
    .ofType(APP_START)
    .take(1)
    .do(() => {
      languages.register({ id: 'cypher' })
      languages.setTokensProvider('cypher', new CypherTokensProvider())
      languages.setLanguageConfiguration('cypher', {
        brackets: [
          ['(', ')'],
          ['{', '}'],
          ['[', ']'],
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
          const { startColumn, endColumn } = model.getWordUntilPosition(
            position
          )
          const range = {
            startLineNumber: position.lineNumber,
            endLineNumber: position.lineNumber,
            startColumn,
            endColumn
          }
          editorSupport.update(model.getValue())
          const items = editorSupport.getCompletion(
            position.lineNumber,
            position.column - 1
          ).items

          const { CompletionItemKind } = languages
          const completionTypes: Record<
            string,
            languages.CompletionItemKind
          > = {
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

          return {
            suggestions: items.map((item, index) => ({
              label: item.view || item.content,
              kind: completionTypes[item.type],
              insertText: item.content,
              range: ['consoleCommand', 'label', 'relationshipType'].includes(
                item.type
              )
                ? { ...range, startColumn: range.startColumn - 1 }
                : item.type === 'procedure'
                ? {
                    ...range,
                    startColumn:
                      range.startColumn - (item.view.indexOf('.') + 1)
                  }
                : range,
              detail: item.postfix || undefined,
              sortText: encodeNumberAsSortableString(index)
            }))
          }
        }
      })

      editor.defineTheme(DARK_THEME, monacoDarkTheme)
      editor.defineTheme(LIGHT_THEME, monacoLightTheme)
      editor.defineTheme(OUTLINE_THEME, monacoLightTheme)
      // Browser's light theme is called 'normal', but OS's light theme is called 'light'
      // 'light' is used when theme is set to light in OS and auto in browser
      editor.defineTheme('light', monacoLightTheme)
    })
    .ignoreElements()
}
function encodeNumberAsSortableString(number: number): string {
  // use letterprefix to encode numbers. breaks after numbers are have more than ~28 digits
  // Monaco by default sorts it's suggestion by label text. But our langauge suppport sorts
  // after relevance first and then alfabethically.
  const A_CHAR = 65
  const prefix = String.fromCharCode(A_CHAR + number.toString().length)
  return `${prefix}${number}`
}

export const updateEditorSupportSchemaEpic: Epic<Action, any> = (
  actions$,
  store
) =>
  actions$
    .do(() => {
      const state = store.getState()
      const schema = {
        consoleCommands,
        parameters: Object.keys(state.params),
        labels: state.meta.labels.map(toLabel) as string[],
        relationshipTypes: state.meta.relationshipTypes.map(
          toRelationshipType
        ) as string[],
        propertyKeys: state.meta.properties.map(toPropertyKey) as string[],
        functions: [
          ...cypherFunctions,
          ...state.meta.functions.map(toFunction)
        ] as string[],
        procedures: state.meta.procedures.map(toProcedure) as string[]
      }
      editorSupport.setSchema(schema)
    })
    .ignoreElements()
