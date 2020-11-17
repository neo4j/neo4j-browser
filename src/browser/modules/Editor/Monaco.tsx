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
import { debounce } from 'lodash-es'
import {
  editor,
  IPosition,
  KeyCode,
  KeyMod,
  languages,
  MarkerSeverity
} from 'monaco-editor/esm/vs/editor/editor.api'
import React, {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useRef
} from 'react'
import { Bus } from 'suber'
import { NEO4J_BROWSER_USER_ACTION_QUERY } from 'services/bolt/txMetadata'
import { CYPHER_REQUEST } from 'shared/modules/cypher/cypherDuck'
import {
  DARK_THEME,
  LIGHT_THEME,
  OUTLINE_THEME
} from 'shared/modules/settings/settingsDuck'
import {
  BrowserTheme,
  monacoDarkTheme,
  monacoLightTheme
} from './CypherMonacoThemes'
import { CypherTokensProvider } from './CypherTokensProvider'

const shouldCheckForHints = (code: any) =>
  code.trim().length > 0 &&
  !code.trimLeft().startsWith(':') &&
  !code
    .trimLeft()
    .toUpperCase()
    .startsWith('EXPLAIN') &&
  !code
    .trimLeft()
    .toUpperCase()
    .startsWith('PROFILE')

export interface MonacoHandles {
  focus: () => void
  getValue: () => string
  setValue: (value: string) => void
  resize: (fillContainer?: boolean, fixedHeight?: number) => void
}

interface MonacoProps {
  bus: Bus
  enableMultiStatementMode?: boolean
  id: string
  value?: string
  onChange?: (value: string) => void
  onChangeLineCount?: (value: number) => void
  onExecute?: () => void
  options?: editor.IGlobalEditorOptions
  theme?: BrowserTheme
  useDb?: null | string
}

const Monaco = forwardRef<MonacoHandles, MonacoProps>(
  (
    {
      bus,
      enableMultiStatementMode = true,
      id,
      value = '',
      onChange = () => undefined,
      onChangeLineCount = () => undefined,
      onExecute = () => undefined,
      theme = LIGHT_THEME,
      useDb
    }: MonacoProps,
    ref
  ): JSX.Element => {
    const editorRef = useRef<editor.IStandaloneCodeEditor | null>(null)
    const monacoId = `monaco-${id}`

    useImperativeHandle(ref, () => ({
      focus() {
        editorRef.current?.focus()
      },
      getValue() {
        return editorRef.current?.getValue() || ''
      },
      setValue(value: string) {
        editorRef.current?.setValue(value)
        editorRef.current?.focus()
        const lines = editorRef.current?.getModel()?.getLinesContent() || []
        const linesLength = lines.length
        editorRef.current?.setPosition({
          lineNumber: linesLength,
          column: lines[linesLength - 1].length + 1
        })
      },
      resize(fillContainer = false, fixedHeight) {
        const container = document.getElementById(monacoId) as HTMLElement
        const contentHeight = editorRef.current?.getContentHeight() || 0

        const height =
          fixedHeight ||
          (fillContainer
            ? container.scrollHeight
            : // lower bound 39px is height of editor frame, upper bound is 12 lines * 23px line height = 276px
              Math.min(276, Math.max(39, contentHeight)))

        container.style.height = `${height}px`
        editorRef.current?.layout({
          height,
          width: container.offsetWidth
        })
      }
    }))

    // The monaco render method does not redraw line numbers
    // Getting and setting content and cursor is done to force a redraw
    useEffect(() => {
      const cursorPosition = editorRef?.current?.getPosition() as IPosition
      editorRef.current?.setValue(editorRef.current?.getValue() || '')
      editorRef.current?.setPosition(cursorPosition)
    }, [useDb])

    // Create monaco instance, listen to text changes and destroy
    useEffect(() => {
      languages.register({ id: 'cypher' })
      languages.setTokensProvider('cypher', new CypherTokensProvider())

      editor.defineTheme(DARK_THEME, monacoDarkTheme)
      editor.defineTheme(LIGHT_THEME, monacoLightTheme)
      editor.defineTheme(OUTLINE_THEME, monacoLightTheme)
      // Browser's light theme is called 'normal', but OS's light theme is called 'light'
      // 'light' is used when theme is set to light in OS and auto in browser
      editor.defineTheme('light', monacoLightTheme)

      editorRef.current = editor.create(
        document.getElementById(monacoId) as HTMLElement,
        {
          automaticLayout: true,
          contextmenu: false,
          cursorStyle: 'block',
          fontFamily: 'Fira Code',
          fontSize: 17,
          fontWeight: '500',
          language: 'cypher',
          lightbulb: { enabled: false },
          lineHeight: 23,
          lineNumbers: (line: number) =>
            isMultiLine() ? '' + line : `${useDbRef.current || ''}$`,
          links: false,
          minimap: { enabled: false },
          scrollbar: {
            alwaysConsumeMouseWheel: false
          },
          scrollBeyondLastColumn: 0,
          scrollBeyondLastLine: false,
          theme: LIGHT_THEME,
          value,
          wordWrap: 'on',
          wrappingStrategy: 'advanced'
        }
      )

      // autocomplete shortcut doesn't work on Mac, Ctrl+Space changes keyboard language, Cmd+Space opens spotlight search
      editorRef.current.addCommand(KeyMod.WinCtrl | KeyCode.Space, autocomplete)
      editorRef.current.addCommand(KeyCode.Enter, () =>
        isMultiLine() ? newLine() : execute()
      )
      editorRef.current.addCommand(KeyCode.UpArrow, handleUp)
      editorRef.current.addCommand(KeyCode.DownArrow, handleDown)
      editorRef.current.addCommand(KeyMod.Shift | KeyCode.Enter, newLine)
      editorRef.current.addCommand(KeyMod.CtrlCmd | KeyCode.Enter, execute)
      editorRef.current.addCommand(KeyMod.WinCtrl | KeyCode.Enter, execute)
      editorRef.current.addCommand(
        KeyMod.CtrlCmd | KeyCode.UpArrow,
        viewHistoryPrevious
      )
      editorRef.current.addCommand(
        KeyMod.CtrlCmd | KeyCode.DownArrow,
        viewHistoryNext
      )
      editorRef.current.addCommand(
        KeyMod.CtrlCmd | KeyCode.US_SLASH,
        displayKeyboardShortcuts
      )
      editorRef.current.addCommand(
        KeyMod.CtrlCmd | KeyCode.US_DOT,
        displayKeyboardShortcuts
      )

      onContentUpdate()

      editorRef.current?.onDidChangeModelContent(onContentUpdate)

      return () => {
        editorRef.current?.dispose()
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    // Update theme when setting is changed
    useEffect(() => {
      editor.setTheme(theme)
    }, [theme])

    // Trigger update when multi statement setting is changed to update warnings
    useEffect(() => {
      onContentUpdate()
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [enableMultiStatementMode])

    const useDbRef = useRef<string | null>(null)

    useEffect(() => {
      useDbRef.current = useDb || ''
    }, [useDb])

    const autocomplete = () => {
      console.log('TODO autocomplete')
    }

    const newLine = () => {
      editorRef.current?.trigger('keyboard', 'type', { text: '\n' })
    }

    const execute = () => {
      const value = editorRef.current?.getValue() || ''
      const onlyWhitespace = value.trim() === ''

      if (!onlyWhitespace) {
        onExecute()
      }
    }

    const isMultiLine = () =>
      (editorRef.current?.getModel()?.getLineCount() as number) > 1

    const handleUp = () => {
      console.log('TODO Up history or move cursor')
    }
    const handleDown = () => {
      console.log('TODO Down history or move cursor')
    }
    const displayKeyboardShortcuts = () => {
      console.log('TODO execute :help keys')
    }
    const viewHistoryPrevious = () => {
      console.log('TODO Ctrl-Up history previous')
    }
    const viewHistoryNext = () => {
      console.log('TODO Ctrl-Up history next')
    }

    // Share current text with parent and add warnings
    const updateCode = () => {
      const text =
        editorRef.current
          ?.getModel()
          ?.getLinesContent()
          .join('\n') || ''

      onChange(text)
      addWarnings(parse(text).referencesListener.queriesAndCommands)
    }

    const debouncedUpdateCode = debounce(updateCode, 300)

    // On each text change, clear warnings and reset countdown to adding warnings
    const onContentUpdate = () => {
      editor.setModelMarkers(
        editorRef.current?.getModel() as editor.ITextModel,
        monacoId,
        []
      )

      onChangeLineCount(editorRef.current?.getModel()?.getLineCount() || 0)
      debouncedUpdateCode()
    }

    const addWarnings = (
      statements: { start: { line: number }; getText: () => string }[]
    ) => {
      if (!statements.length) return

      const model = editorRef.current?.getModel() as editor.ITextModel

      // clearing markers again solves issue with incorrect multi-statement warning when user spam clicks setting on and off
      editor.setModelMarkers(
        editorRef.current?.getModel() as editor.ITextModel,
        monacoId,
        []
      )

      // add multi statement warning if multi setting is off
      if (statements.length > 1 && !enableMultiStatementMode) {
        const secondStatementLine = statements[1].start.line
        editor.setModelMarkers(model, monacoId, [
          {
            startLineNumber: secondStatementLine,
            startColumn: 1,
            endLineNumber: secondStatementLine,
            endColumn: 1000,
            message:
              'To use multi statement queries, please enable multi statement in the settings panel.',
            severity: MarkerSeverity.Warning
          }
        ])
      }

      // add a warning for each notification returned by explain query
      statements.forEach(statement => {
        const text = statement.getText()
        if (!shouldCheckForHints(text)) {
          return
        }
        const statementLineNumber = statement.start.line - 1

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
              editor.setModelMarkers(model, monacoId, [
                ...editor.getModelMarkers({ owner: monacoId }),
                ...response.result.summary.notifications.map(
                  ({
                    description,
                    position: { line },
                    title
                  }: {
                    description: string
                    position: { line: number }
                    title: string
                  }) => ({
                    startLineNumber: statementLineNumber + line,
                    startColumn: 1,
                    endLineNumber: statementLineNumber + line,
                    endColumn: 1000,
                    message: title + '\n\n' + description,
                    severity: MarkerSeverity.Warning
                  })
                )
              ])
            }
          }
        )
      })
    }

    return (
      <div
        id={monacoId}
        style={{
          height: '100%',
          maxWidth: '100%',
          minWidth: '100%',
          width: '100%'
        }}
      />
    )
  }
)

export default Monaco
