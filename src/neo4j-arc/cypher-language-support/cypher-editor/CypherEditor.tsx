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
import { QueryOrCommand, parse } from 'cypher-editor-support'
import { debounce } from 'lodash-es'
import { QuickInputList } from 'monaco-editor/esm/vs/base/parts/quickinput/browser/quickInputList'
import 'monaco-editor/esm/vs/editor/editor.all.js'
import * as monaco from 'monaco-editor/esm/vs/editor/editor.api'
import { QueryResult } from 'neo4j-driver-core'
import React from 'react'
import styled from 'styled-components'
import { ResizeObserver } from '@juggle/resize-observer'

const shouldCheckForHints = (code: string) =>
  code.trim().length > 0 &&
  !code.trimLeft().startsWith(':') &&
  !code.trimLeft().toUpperCase().startsWith('EXPLAIN') &&
  !code.trimLeft().toUpperCase().startsWith('PROFILE')

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

const EXPLAIN_QUERY_PREFIX = 'EXPLAIN '
const EXPLAIN_QUERY_PREFIX_LENGTH = EXPLAIN_QUERY_PREFIX.length
const EDITOR_UPDATE_DEBOUNCE_TIME = 300
type CypherEditorDefaultProps = {
  className: string
  enableMultiStatementMode: boolean
  fontLigatures: boolean
  history: string[]
  id: string
  isFullscreen: boolean
  onChange: (value: string) => void
  onDisplayHelpKeys: () => void
  onExecute: (value: string) => void
  sendCypherQuery: (query: string) => Promise<QueryResult>
  toggleFullscreen: () => void
  useDb: null | string
  value: string
}

export type CypherEditorProps = CypherEditorDefaultProps
const cypherEditorDefaultProps: CypherEditorDefaultProps = {
  className: '',
  enableMultiStatementMode: false,
  fontLigatures: true,
  history: [],
  id: 'main',
  isFullscreen: false,
  onChange: () => undefined,
  onDisplayHelpKeys: () => undefined,
  onExecute: () => undefined,
  sendCypherQuery: () =>
    new Promise(res =>
      res({
        result: { summary: { notifications: [] } }
      } as any)
    ),
  toggleFullscreen: () => undefined,
  useDb: null,
  value: ''
}

type CypherEditorState = { currentHistoryIndex: number; draft: string }
const UNRUN_CMD_HISTORY_INDEX = -1

export class CypherEditor extends React.Component<
  CypherEditorProps,
  CypherEditorState
> {
  state: CypherEditorState = {
    currentHistoryIndex: UNRUN_CMD_HISTORY_INDEX,
    draft: ''
  }
  resizeObserver: ResizeObserver
  editor?: monaco.editor.IStandaloneCodeEditor
  container?: HTMLElement

  constructor(props: CypherEditorProps) {
    super(props)

    // Wrapped in requestAnimationFrame to avoid the error "ResizeObserver loop limit exceeded"
    this.resizeObserver = new ResizeObserver(() => {
      window.requestAnimationFrame(() => {
        this.editor?.layout()
      })
    })
  }

  static defaultProps = cypherEditorDefaultProps

  private getMonacoId = (): string => `monaco-${this.props.id}`
  private debouncedUpdateCode = debounce(() => {
    const text = this.editor?.getModel()?.getLinesContent().join('\n') || ''

    this.props.onChange?.(text)
    this.addWarnings(parse(text).referencesListener.queriesAndCommands)
  }, EDITOR_UPDATE_DEBOUNCE_TIME)
  focus = (): void => {
    this.editor?.focus()
  }
  setPosition = (pos: { lineNumber: number; column: number }): void => {
    this.editor?.setPosition(pos)
  }
  private newLine = (): void =>
    this.editor?.trigger('keyboard', 'type', { text: '\n' })
  private isMultiLine = (): boolean =>
    (this.editor?.getModel()?.getLineCount() || 0) > 1

  private updateGutterCharWidth = (dbName: string): void => {
    this.editor?.updateOptions({
      lineNumbersMinChars:
        dbName.length && !this.isMultiLine() ? dbName.length * 1.3 : 2
    })
  }

  resize = (fillContainer: boolean): void => {
    if (!this.container || !this.editor) return
    const contentHeight = this.editor.getContentHeight()

    const height = fillContainer
      ? Math.min(window.innerHeight - 20, this.container.scrollHeight)
      : Math.min(276, contentHeight) // Upper bound is 12 lines * 23px line height = 276px

    this.container.style.height = `${height}px`
    this.editor.layout({
      height,
      width: this.container.offsetWidth
    })
  }

  getValue = (): string => this.editor?.getValue() || ''
  setValue = (value: string): void => {
    this.setState({ currentHistoryIndex: UNRUN_CMD_HISTORY_INDEX })
    this.internalSetValue(value)
  }
  private internalSetValue = (value: string): void => {
    if (!this.editor) return
    this.editor.setValue(value)
    this.editor.focus()

    const lines = this.editor.getModel()?.getLinesContent() || []
    const linesLength = lines.length
    this.editor.setPosition({
      lineNumber: linesLength,
      column: lines[linesLength - 1].length + 1
    })
  }

  private handleUp = (): void => {
    if (this.isMultiLine()) {
      this.editor?.trigger('', 'cursorUp', null)
    } else {
      this.viewHistoryPrevious()
    }
  }

  private viewHistoryPrevious = (): void => {
    const { history } = this.props
    const { currentHistoryIndex } = this.state
    const newHistoryIndex = currentHistoryIndex + 1

    if (history.length === 0) return
    if (newHistoryIndex === history.length) return

    if (currentHistoryIndex === UNRUN_CMD_HISTORY_INDEX) {
      // Save what's currently in the editor as a local draft
      this.setState({
        draft: this.editor?.getValue() || '',
        currentHistoryIndex: 0
      })
    }

    this.internalSetValue(history[newHistoryIndex])
    this.setState({ currentHistoryIndex: newHistoryIndex })
  }

  private handleDown = (): void => {
    if (this.isMultiLine()) {
      this.editor?.trigger('', 'cursorDown', null)
    } else {
      this.viewHistoryNext()
    }
  }

  private viewHistoryNext = (): void => {
    const { history } = this.props
    const { currentHistoryIndex } = this.state
    const newHistoryIndex = currentHistoryIndex - 1

    if (history.length === 0) return
    if (currentHistoryIndex === UNRUN_CMD_HISTORY_INDEX) return

    if (newHistoryIndex === UNRUN_CMD_HISTORY_INDEX) {
      // Read saved draft
      this.internalSetValue(this.state.draft)
    } else {
      this.internalSetValue(this.props.history[newHistoryIndex])
    }

    this.setState({ currentHistoryIndex: newHistoryIndex })
  }

  private execute = (): void => {
    const value = this.getValue()
    const onlyWhitespace = value.trim() === ''

    if (!onlyWhitespace) {
      this.props.onExecute?.(value)
      this.setState({ currentHistoryIndex: UNRUN_CMD_HISTORY_INDEX })
    }
  }

  private onContentUpdate = (): void => {
    const model = this.editor?.getModel()
    if (!model) return

    monaco.editor.setModelMarkers(model, this.getMonacoId(), [])

    this.updateGutterCharWidth(this.props.useDb || '')
    this.debouncedUpdateCode()
  }

  private addWarnings = (statements: QueryOrCommand[]): void => {
    const model = this.editor?.getModel()
    if (!statements.length || !model) return

    // clearing markers again solves issue with incorrect multi-statement warning when user spam clicks setting on and off
    monaco.editor.setModelMarkers(model, this.getMonacoId(), [])

    // add multi statement warning if multi setting is off
    if (statements.length > 1 && !this.props.enableMultiStatementMode) {
      const secondStatementLine = statements[1].start.line
      monaco.editor.setModelMarkers(model, this.getMonacoId(), [
        {
          startLineNumber: secondStatementLine,
          startColumn: 1,
          endLineNumber: secondStatementLine,
          endColumn: 1000,
          message:
            'To use multi statement queries, please enable multi statement in the settings panel.',
          severity: monaco.MarkerSeverity.Warning
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

      this.props
        .sendCypherQuery(EXPLAIN_QUERY_PREFIX + text)
        .then((result: QueryResult) => {
          if (result.summary.notifications.length > 0) {
            monaco.editor.setModelMarkers(model, this.getMonacoId(), [
              ...monaco.editor.getModelMarkers({ owner: this.getMonacoId() }),
              ...result.summary.notifications.map(
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
                    severity: monaco.MarkerSeverity.Warning
                  }
                }
              )
            ])
          }
        })
        .catch(() => {
          /* Parent should ensure connection */
        })
    })
  }

  componentDidMount = (): void => {
    this.container = document.getElementById(this.getMonacoId()) ?? undefined
    if (!this.container) return

    this.editor = monaco.editor.create(this.container, {
      autoClosingOvertype: 'always',
      contextmenu: false,
      cursorStyle: 'block',
      fontFamily: '"Fira Code", Monaco, "Courier New", Terminal, monospace',
      fontLigatures: this.props.fontLigatures,
      fontSize: 17,
      fontWeight: '400',
      hideCursorInOverviewRuler: true,
      language: 'cypher',
      lightbulb: { enabled: false },
      lineHeight: 23,
      lineNumbers: (line: number) =>
        this.isMultiLine() ? line.toString() : `${this.props.useDb || ''}$`,
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
      value: this.props.value,
      wordWrap: 'on',
      wrappingStrategy: 'advanced'
    })

    const { KeyCode, KeyMod } = monaco
    this.editor.addCommand(
      KeyCode.Enter,
      () => {
        this.isMultiLine() ? this.newLine() : this.execute()
      },
      '!suggestWidgetVisible && !findWidgetVisible'
    )
    this.editor.addCommand(
      KeyCode.UpArrow,
      this.handleUp,
      '!suggestWidgetVisible'
    )
    this.editor.addCommand(
      KeyCode.DownArrow,
      this.handleDown,
      '!suggestWidgetVisible'
    )
    this.editor.addCommand(KeyMod.Shift | KeyCode.Enter, this.newLine)
    this.editor.addCommand(KeyMod.CtrlCmd | KeyCode.Enter, this.execute)
    this.editor.addCommand(KeyMod.WinCtrl | KeyCode.Enter, this.execute)
    this.editor.addCommand(
      KeyMod.CtrlCmd | KeyCode.UpArrow,
      this.viewHistoryPrevious
    )
    this.editor.addCommand(
      KeyMod.CtrlCmd | KeyCode.DownArrow,
      this.viewHistoryNext
    )
    this.editor.addCommand(
      KeyMod.CtrlCmd | KeyCode.US_DOT,
      this.props.onDisplayHelpKeys
    )
    this.editor.addCommand(
      KeyCode.Escape,
      this.props.toggleFullscreen,
      '!suggestWidgetVisible && !findWidgetVisible'
    )

    this.onContentUpdate()

    this.editor.onDidChangeModelContent(this.onContentUpdate)
    this.editor.onDidContentSizeChange(() =>
      this.resize(this.props.isFullscreen)
    )

    this.resizeObserver.observe(this.container)

    /*
     * This moves the the command palette widget out of of the overflow-guard div where overlay widgets
     * are located, into the overflowing content widgets div.
     * This solves the command palette being squashed when the cypher editor is only a few lines high.
     * The workaround is based on a suggestion found in the github issue: https://github.com/microsoft/monaco-editor/issues/70
     */
    const quickInputDOMNode = this.editor.getContribution<
      { widget: { domNode: HTMLElement } } & monaco.editor.IEditorContribution
    >('editor.controller.quickInput').widget.domNode
    // @ts-ignore since we use internal APIs
    this.editor._modelData.view._contentWidgets.overflowingContentWidgetsDomNode.domNode.appendChild(
      quickInputDOMNode.parentNode?.removeChild(quickInputDOMNode)
    )

    QuickInputList.prototype.layout = function (maxHeight: number) {
      this.list.getHTMLElement().style.maxHeight =
        maxHeight < 200 ? '200px' : Math.floor(maxHeight) + 'px'
      this.list.layout()
    }
  }

  render(): JSX.Element {
    return (
      <MonacoStyleWrapper
        id={this.getMonacoId()}
        className={this.props.className}
      />
    )
  }

  componentDidUpdate(prevProps: CypherEditorProps): void {
    const { useDb, fontLigatures, enableMultiStatementMode } = this.props
    if (fontLigatures !== prevProps.fontLigatures) {
      this.editor?.updateOptions({ fontLigatures })
    }

    // Line numbers need to be redrawn after db is changed
    if (useDb !== prevProps.useDb) {
      const cursorPosition = this.editor?.getPosition() as monaco.IPosition
      this.editor?.setValue(this.editor?.getValue() || '')
      this.editor?.setPosition(cursorPosition)
    }

    // If changing multistatement setting, add or remove warnings if needed
    if (enableMultiStatementMode !== prevProps.enableMultiStatementMode) {
      this.onContentUpdate()
    }
  }

  componentWillUnmount = (): void => {
    this.editor?.dispose()
    this.debouncedUpdateCode?.cancel()
    this.resizeObserver.disconnect()
  }
}
