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

import { QuickInputList } from 'monaco-editor/esm/vs/base/parts/quickinput/browser/quickInputList'
import { parse, QueryOrCommand } from 'cypher-editor-support'
import { debounce } from 'lodash-es'
import {
  editor,
  IPosition,
  KeyCode,
  KeyMod,
  MarkerSeverity
} from 'monaco-editor/esm/vs/editor/editor.api'
import React, {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useRef
} from 'react'
import ResizeObserver from 'resize-observer-polyfill'
import styled from 'styled-components'
import { Bus } from 'suber'

import { NEO4J_BROWSER_USER_ACTION_QUERY } from 'services/bolt/txMetadata'
import { CYPHER_REQUEST } from 'shared/modules/cypher/cypherDuck'
import { QueryResult } from 'neo4j-driver'

const shouldCheckForHints = (code: string) =>
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
  setPosition: (position: { lineNumber: number; column: number }) => void
}

const MonacoStyleWrapper = styled.div`
  height: 100%;
  width: 100%;

  .margin .margin-view-overlays {
    margin-left: 10px;
  }

  // hides the "Peek Problem" status bar on the warnings hover widgets
  .hover-row.status-bar {
    display: none !important;
  }
`

interface MonacoProps {
  bus: Bus
  enableMultiStatementMode?: boolean
  fontLigatures?: boolean
  history?: string[]
  id: string
  value?: string
  onChange?: (value: string) => void
  onDisplayHelpKeys?: () => void
  onExecute?: (value: string) => void
  useDb?: null | string
  toggleFullscreen: () => void
}

const EXPLAIN_QUERY_PREFIX = 'EXPLAIN '
const EXPLAIN_QUERY_PREFIX_LENGTH = EXPLAIN_QUERY_PREFIX.length
const Monaco = forwardRef<MonacoHandles, MonacoProps>(
  (
    {
      bus,
      enableMultiStatementMode = true,
      fontLigatures = true,
      history = [],
      id,
      value = '',
      onChange = () => undefined,
      onDisplayHelpKeys = () => undefined,
      onExecute = () => undefined,
      useDb,
      toggleFullscreen
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
        setValue(value)
        historyIndexRef.current = -1
      },
      resize(fillContainer = false) {
        resize(fillContainer)
      },
      setPosition(pos: { lineNumber: number; column: number }) {
        editorRef.current?.setPosition(pos)
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
      editorRef.current = editor.create(
        document.getElementById(monacoId) as HTMLElement,
        {
          autoClosingOvertype: 'always',
          contextmenu: false,
          cursorStyle: 'block',
          fontFamily: '"Fira Code", Monaco, "Courier New", Terminal, monospace',
          fontLigatures,
          fontSize: 17,
          fontWeight: '400',
          hideCursorInOverviewRuler: true,
          language: 'cypher',
          lightbulb: { enabled: false },
          lineHeight: 23,
          lineNumbers: (line: number) =>
            isMultiLine() ? line.toString() : `${useDbRef.current || ''}$`,
          links: false,
          minimap: { enabled: false },
          overviewRulerBorder: false,
          overviewRulerLanes: 0,
          quickSuggestions: false,
          renderLineHighlight: 'none',
          scrollbar: {
            alwaysConsumeMouseWheel: false,
            useShadows: false
          },
          scrollBeyondLastColumn: 0,
          scrollBeyondLastLine: false,
          selectionHighlight: false,
          value,
          wordWrap: 'on',
          wrappingStrategy: 'advanced'
        }
      )

      editorRef.current.addCommand(
        KeyCode.Enter,
        () => (isMultiLine() ? newLine() : execute()),
        '!suggestWidgetVisible && !findWidgetVisible'
      )
      editorRef.current.addCommand(
        KeyCode.UpArrow,
        handleUp,
        '!suggestWidgetVisible'
      )
      editorRef.current.addCommand(
        KeyCode.DownArrow,
        handleDown,
        '!suggestWidgetVisible'
      )
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
        KeyMod.CtrlCmd | KeyCode.US_DOT,
        onDisplayHelpKeys
      )
      editorRef.current.addCommand(
        KeyCode.Escape,
        toggleFullscreen,
        '!suggestWidgetVisible && !findWidgetVisible'
      )

      onContentUpdate()

      editorRef.current?.onDidChangeModelContent(() => onContentUpdate(true))

      editorRef.current?.onDidContentSizeChange(() =>
        resize(isFullscreenRef.current)
      )

      const container = document.getElementById(monacoId) as HTMLElement
      const resizeObserver = new ResizeObserver(() => {
        // Wrapped in requestAnimationFrame to avoid the error "ResizeObserver loop limit exceeded"
        window.requestAnimationFrame(() => {
          editorRef.current?.layout()
        })
      })
      resizeObserver.observe(container)

      /*
       * This moves the the command palette widget out of of the overflow-guard div where overlay widgets
       * are located, into the overflowing content widgets div.
       * This solves the command palette being squashed when the cypher editor is only a few lines high.
       * The workaround is based on a suggestion found in the github issue: https://github.com/microsoft/monaco-editor/issues/70
       */
      const quickInputDOMNode = editorRef.current.getContribution<
        { widget: { domNode: HTMLElement } } & editor.IEditorContribution
      >('editor.controller.quickInput').widget.domNode
      ;(editorRef.current as any)._modelData.view._contentWidgets.overflowingContentWidgetsDomNode.domNode.appendChild(
        quickInputDOMNode.parentNode?.removeChild(quickInputDOMNode)
      )
      QuickInputList.prototype.layout = function(maxHeight: number) {
        this.list.getHTMLElement().style.maxHeight =
          maxHeight < 200 ? '200px' : Math.floor(maxHeight) + 'px'
        this.list.layout()
      }

      return () => {
        editorRef.current?.dispose()
        debouncedUpdateCode.cancel()
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    const isFullscreenRef = useRef<boolean>(false)

    const resize = (fillContainer: boolean) => {
      const container = document.getElementById(monacoId) as HTMLElement
      const contentHeight = editorRef.current?.getContentHeight() || 0

      isFullscreenRef.current = fillContainer

      const height = fillContainer
        ? Math.min(window.innerHeight - 20, container.scrollHeight)
        : Math.min(276, contentHeight) // Upper bound is 12 lines * 23px line height = 276px

      container.style.height = `${height}px`
      editorRef.current?.layout({
        height,
        width: container.offsetWidth
      })
    }

    // Trigger update when multi statement setting is changed to update warnings
    useEffect(() => {
      onContentUpdate()
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [enableMultiStatementMode, useDb])

    useEffect(() => {
      editorRef.current?.updateOptions({ fontLigatures })
    }, [fontLigatures])

    const useDbRef = useRef<string | null>(null)

    useEffect(() => {
      useDbRef.current = useDb || ''
    }, [useDb])

    const newLine = () => {
      editorRef.current?.trigger('keyboard', 'type', { text: '\n' })
    }

    const execute = () => {
      const value = editorRef.current?.getValue() || ''
      const onlyWhitespace = value.trim() === ''

      if (!onlyWhitespace) {
        onExecute(value)
        historyIndexRef.current = -1
      }
    }

    const isMultiLine = () =>
      (editorRef.current?.getModel()?.getLineCount() as number) > 1

    const handleUp = () => {
      if (isMultiLine()) {
        editorRef.current?.trigger('', 'cursorUp', null)
      } else {
        viewHistoryPrevious()
      }
    }

    const handleDown = () => {
      if (isMultiLine()) {
        editorRef.current?.trigger('', 'cursorDown', null)
      } else {
        viewHistoryNext()
      }
    }

    const setValue = (value: string) => {
      editorRef.current?.setValue(value)
      editorRef.current?.focus()
      const lines = editorRef.current?.getModel()?.getLinesContent() || []
      const linesLength = lines.length
      editorRef.current?.setPosition({
        lineNumber: linesLength,
        column: lines[linesLength - 1].length + 1
      })
    }

    useEffect(() => {
      historyRef.current = [...history]
    }, [history])

    const historyRef = useRef<string[]>([])
    const historyIndexRef = useRef<number>(-1)
    const draftRef = useRef<string>('')

    const viewHistoryPrevious = () => {
      const localHistory = historyRef.current
      const localHistoryIndex = historyIndexRef.current

      if (!localHistory.length) return
      if (localHistoryIndex + 1 === localHistory.length) return
      if (localHistoryIndex === -1) {
        // Save what's currently in the editor as a local draft
        draftRef.current = editorRef.current?.getValue() || ''
      }
      historyIndexRef.current = localHistoryIndex + 1
      setValue(localHistory[localHistoryIndex + 1])
    }

    const viewHistoryNext = () => {
      const localHistory = historyRef.current
      const localHistoryIndex = historyIndexRef.current

      if (!localHistory.length) return
      if (localHistoryIndex <= -1) return
      if (localHistoryIndex === 0) {
        // Read saved draft
        historyIndexRef.current = localHistoryIndex - 1
        setValue(draftRef.current)
        return
      }
      historyIndexRef.current = localHistoryIndex - 1
      setValue(localHistory[localHistoryIndex - 1])
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

    const updateGutterCharWidth = (dbName: string) => {
      editorRef.current?.updateOptions({
        lineNumbersMinChars:
          dbName.length && !isMultiLine() ? dbName.length * 1.3 : 2
      })
    }

    // On each text change, clear warnings and reset countdown to adding warnings
    const onContentUpdate = (preferRef = false) => {
      editor.setModelMarkers(
        editorRef.current?.getModel() as editor.ITextModel,
        monacoId,
        []
      )

      updateGutterCharWidth((preferRef ? useDbRef.current : useDb) || '')
      debouncedUpdateCode()
    }

    const addWarnings = (statements: QueryOrCommand[]) => {
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
            query: EXPLAIN_QUERY_PREFIX + text,
            queryType: NEO4J_BROWSER_USER_ACTION_QUERY
          },
          (response: { result: QueryResult; success?: boolean }) => {
            if (
              response.success === true &&
              response.result.summary.notifications.length > 0
            ) {
              editor.setModelMarkers(model, monacoId, [
                ...editor.getModelMarkers({ owner: monacoId }),
                ...response.result.summary.notifications.map(
                  ({ description, position, title }) => {
                    const line = 'line' in position ? position.line : 0
                    const column = 'column' in position ? position.column : 0
                    return {
                      startLineNumber: statementLineNumber + line,
                      startColumn:
                        statement.start.column +
                        (line === 1
                          ? column - EXPLAIN_QUERY_PREFIX_LENGTH
                          : column),
                      endLineNumber: statement.stop.line,
                      endColumn: statement.stop.column + 2,
                      message: title + '\n\n' + description,
                      severity: MarkerSeverity.Warning
                    }
                  }
                )
              ])
            }
          }
        )
      })
    }

    return <MonacoStyleWrapper id={monacoId} />
  }
)

export default Monaco
