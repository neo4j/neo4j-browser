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
import React, { useEffect, useRef, useState } from 'react'
import { connect } from 'react-redux'
import { withBus } from 'react-suber'
import { Action, Dispatch } from 'redux'
import { Bus } from 'suber'
import { Icons } from 'browser/components/icons'
import { MAIN_WRAPPER_DOM_ID } from '../App/App'
import { ExportItem } from './ExportButton'
import { GlobalState } from 'shared/globalState'
import * as app from 'shared/modules/app/appDuck'
import * as commands from 'shared/modules/commands/commandsDuck'
import * as editorDuck from 'shared/modules/editor/editorDuck'
import { addFavorite } from 'shared/modules/favorites/favoritesDuck'
import {
  Frame,
  TRACK_SAVE_AS_PROJECT_FILE
} from 'shared/modules/frames/framesDuck'
import { getParams } from 'shared/modules/params/paramsDuck'
import {
  BrowserRequest,
  cancel as cancelRequest,
  getRequest
} from 'shared/modules/requests/requestsDuck'
import {
  codeFontLigatures,
  shouldEnableMultiStatementMode
} from 'shared/modules/settings/settingsDuck'
import * as sidebar from 'shared/modules/sidebar/sidebarDuck'

import { MonacoEditor } from 'browser/components/Editor/MonacoEditor'
import { KeyCode, editor } from 'monaco-editor'
import { Button } from 'browser/components/base/Button'
import styled from 'styled-components'

const EditorContainer = styled.div`
  width: 100%;
  height: 100%;
`

type FrameEditorBaseProps = {
  frame: Frame
  fullscreenToggle: () => void
  exportItems: ExportItem[]
  bus: Bus
  params: Record<string, unknown>
}

type FrameEditorProps = FrameEditorBaseProps & {
  request: BrowserRequest | null
  isRelateAvailable: boolean
  codeFontLigatures: boolean
  enableMultiStatementMode: boolean
  newFavorite: (cmd: string) => void
  newProjectFile: (cmd: string) => void
  cancelQuery: (requestId: string) => void
  reRun: (obj: Frame, cmd: string) => void
  onTitlebarCmdClick: (cmd: string) => void
}

function FrameEditor({
  codeFontLigatures,
  reRun,
  frame,
  fullscreenToggle,
  onTitlebarCmdClick,
}: FrameEditorProps) {
  const [editorValue, setEditorValue] = useState(frame.cmd)
  const [renderEditor, setRenderEditor] = useState(frame.isRerun)

  useEffect(() => {
    const editor = editorRef.current
    if (editor) {
      editor.setValue(frame.cmd)
    }
  }, [frame.cmd])
  const editorRef = useRef<editor.IStandaloneCodeEditor>(null)

  function run(cmd: string) {
    reRun(frame, cmd)
  }
  function onPreviewClick(e: React.MouseEvent) {
    if (e.ctrlKey || e.metaKey) {
      onTitlebarCmdClick(editorValue)
    } else {
      startTransition()
    }
  }

  const titleBarRef = useRef<HTMLDivElement>(null)
  useEffect(() => {
    // We want clicks outside the frame itself, not just the titlebar.
    // Because of how the component tree is built (we don't have a
    // reference to the full frame body) we'd need to pass
    // a ref from each parent to avoid this dom traversal
    function handleClickOutside(event: MouseEvent) {
      if (!(event.target instanceof Element)) {
        return
      }
      const insideFrame = titleBarRef.current
        ?.closest('article')
        ?.contains(event.target)

      const insideMainWrapper = document
        .getElementById(MAIN_WRAPPER_DOM_ID)
        ?.contains(event.target)

      if (!insideFrame && insideMainWrapper) {
        // Monaco has a 300ms debounce on calling it's onChange
        // using this ref prevents us from losing the edits made in the
        // last 300ms before clicking
        const editorRefVal = editorRef.current?.getValue()
        if (editorRefVal && editorRefVal !== editorValue) {
          setEditorValue(editorRefVal)
        }
        setRenderEditor(false)
      }
    }

    document.addEventListener('mouseup', handleClickOutside)
    return () => {
      document.removeEventListener('mouseup', handleClickOutside)
    }
  })

  useEffect(() => {
    if (renderEditor) {
      const editor = editorRef.current
      if (editor) {
        editor.focus()
        
        const content = editor.getValue()
        const lines = content.split('\n')
        const lastLine = lines.length
        const lastColumn = lines[lastLine - 1].length + 1
        
        editor.setPosition({
          lineNumber: lastLine,
          column: lastColumn
        })
      }
    }
  }, [renderEditor])

  // the last run command (history index 1) is already in the editor
  // don't show it as history as well
  const history = (frame.history || []).slice(1)



  const additionalCommands = {
    [KeyCode.Escape]: {
      handler: fullscreenToggle,
      context: '!suggestWidgetVisible && !findWidgetVisible'
    }
  }

  const onRunClick = () => {
    run(editorValue)
  }

  const startTransition = () => {
    if (document.startViewTransition) {
      document.startViewTransition(() => {
        setRenderEditor(true)
      })
    } else {
      setRenderEditor(true)
    }
  }

  return (
    <div className="flex flex-col view-transition-new">
      <div className="flex items-center justify-between p-2 bg-surface-secondary dark:bg-surface-secondary-dark">
        {/* Frame header */}
        <div className="flex items-center space-x-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={onRunClick}
            className="flex items-center space-x-1"
          >
            <Icons.Play className="icon icon-sm" />
            <span>Run</span>
          </Button>
        </div>
      </div>

      {/* Editor area */}
      <div className="flex-1 min-h-0">
        <EditorContainer onClick={onPreviewClick} data-testid="frameCommand">
          <MonacoEditor
            value={editorValue}
            onChange={setEditorValue}
            onExecute={run}
            className="h-full"
            id={`editor-${frame.id}`}
            ref={editorRef}
            additionalCommands={additionalCommands}
            fontLigatures={codeFontLigatures}
            history={history}
          />
        </EditorContainer>
      </div>
    </div>
  )
}

const mapStateToProps = (
  state: GlobalState,
  ownProps: FrameEditorBaseProps
) => {
  const request = ownProps.frame.requestId
    ? getRequest(state, ownProps.frame.requestId)
    : null

  return {
    request,
    isRelateAvailable: app.isRelateAvailable(state),
    codeFontLigatures: codeFontLigatures(state),
    enableMultiStatementMode: shouldEnableMultiStatementMode(state),
    params: getParams(state)
  }
}

const mapDispatchToProps = (dispatch: Dispatch<Action>) => {
  return {
    newFavorite: (cmd: string) => {
      dispatch(addFavorite(cmd))
      dispatch(sidebar.open('favorites'))
    },
    newProjectFile: (cmd: string) => {
      dispatch(sidebar.setDraftScript(cmd, 'project files'))
      dispatch({ type: TRACK_SAVE_AS_PROJECT_FILE })
    },
    cancelQuery: (requestId: string) => {
      dispatch(cancelRequest(requestId))
    },
    reRun: ({ useDb, id, requestId }: Frame, cmd: string) => {
      if (requestId) {
        dispatch(cancelRequest(requestId))
      }

      dispatch(
        commands.executeCommand(cmd, {
          id,
          useDb,
          isRerun: true,
          source: commands.commandSources.rerunFrame
        })
      )
    },
    onTitlebarCmdClick: (cmd: string) => {
      dispatch(editorDuck.setContent(cmd))
    }
  }
}

export default withBus(
  connect(mapStateToProps, mapDispatchToProps)(FrameEditor)
)
