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

import { connect } from 'react-redux'
import React, { useCallback, useEffect, useRef, useState } from 'react'
import { withBus } from 'react-suber'
import { saveAs } from 'file-saver'
import { map } from 'lodash-es'
import SVGInline from 'react-svg-inline'
import controlsPlay from 'icons/controls-play.svg'

import * as app from 'shared/modules/app/appDuck'
import * as commands from 'shared/modules/commands/commandsDuck'
import * as sidebar from 'shared/modules/sidebar/sidebarDuck'
import * as editor from 'shared/modules/editor/editorDuck'
import {
  cancel as cancelRequest,
  getRequest,
  BrowserRequest,
  REQUEST_STATUS_PENDING
} from 'shared/modules/requests/requestsDuck'
import {
  Frame,
  pin,
  remove,
  TRACK_COLLAPSE_TOGGLE,
  TRACK_FULLSCREEN_TOGGLE,
  TRACK_SAVE_AS_PROJECT_FILE,
  unpin
} from 'shared/modules/stream/streamDuck'
import { sleep } from 'shared/services/utils'
import { FrameButton } from 'browser-components/buttons'
import ConfirmationDialog from 'browser-components/ConfirmationDialog'
import Render from 'browser-components/Render'
import { CSVSerializer } from 'services/serializer'
import {
  CloseIcon,
  ContractIcon,
  DownIcon,
  DownloadIcon,
  ExpandIcon,
  PinIcon,
  RunIcon,
  UpIcon,
  SaveFavorite,
  StopIcon
} from 'browser-components/icons/Icons'
import {
  DottedLineHover,
  DropdownButton,
  DropdownContent,
  DropdownItem,
  DropDownItemDivider,
  DropdownList
} from '../Stream/styled'
import {
  StyledFrameTitleBar,
  StyledFrameTitlebarButtonSection,
  FrameTitleEditorContainer,
  StyledFrameCommand
} from './styled'
import {
  downloadPNGFromSVG,
  downloadSVG
} from 'shared/services/exporting/imageUtils'
import {
  stringifyResultArray,
  transformResultRecordsToResultArray,
  recordToJSONMapper
} from 'browser/modules/Stream/CypherFrame/helpers'
import { csvFormat, stringModifier } from 'services/bolt/cypherTypesFormatting'
import arrayHasItems from 'shared/utils/array-has-items'
import { stringifyMod } from 'services/utils'
import Monaco, { MonacoHandles } from '../Editor/Monaco'
import { Bus } from 'suber'
import FeatureToggle from '../FeatureToggle/FeatureToggle'
import { reusableFrame } from 'shared/modules/experimentalFeatures/experimentalFeaturesDuck'

type FrameTitleBarBaseProps = {
  frame: any
  fullscreen: boolean
  fullscreenToggle: () => void
  collapse: boolean
  collapseToggle: () => void
  pinned: boolean
  togglePin: () => void
  numRecords: number
  getRecords: () => any
  visElement: any
  runQuery: () => any
  bus: Bus
}

type FrameTitleBarProps = FrameTitleBarBaseProps & {
  request: BrowserRequest | null
  isRelateAvailable: boolean
  newFavorite: (cmd: string) => void
  newProjectFile: (cmd: string) => void
  cancelQuery: (requestId: string) => void
  onCloseClick: (
    frameId: string,
    requestId: string,
    request: BrowserRequest | null
  ) => void
  onRunClick: () => void
  reRun: (obj: Frame, cmd: string) => void
  togglePinning: (id: string, isPinned: boolean) => void
  onTitlebarClick: (cmd: string) => void
  trackFullscreenToggle: () => void
  trackCollapseToggle: () => void
}

function FrameTitlebar(props: FrameTitleBarProps) {
  const [editorValue, setEditorValue] = useState(props.frame.cmd)
  const [confirmationDialogOpen, setConfirmationDialogOpen] = useState(false)
  const editorRef = useRef<MonacoHandles>(null)

  /* When the frametype is changed the titlebar is unmounted
  and replaced with a new instance. This means focus cursor position are lost.
  To regain editor focus we run an effect dependant on the isRerun prop.
  However, when the frame prop changes in some way the effect is retriggered
  although the "isRun" is still true. Use effect does not check for equality
  but instead re-runs the effect to take focus again. To prevent this
  we use the useCallback hook as well. As a best effort we set the cursor position
  to be at the end of the query.

  A better solution is to change the frame titlebar to reside outside of the 
  frame contents.
  */

  const gainFocusCallback = useCallback(() => {
    if (props.frame.isRerun) {
      editorRef.current?.focus()

      const lines = (editorRef.current?.getValue() || '').split('\n')
      const linesLength = lines.length
      editorRef.current?.setPosition({
        lineNumber: linesLength,
        column: lines[linesLength - 1].length + 1
      })
    }
  }, [props.frame.isRerun])
  useEffect(gainFocusCallback, [gainFocusCallback])

  function hasData() {
    return props.numRecords > 0
  }

  function exportCSV(records: any) {
    const exportData = stringifyResultArray(
      csvFormat,
      transformResultRecordsToResultArray(records)
    )
    const data = exportData.slice()
    const csv = CSVSerializer(data.shift())
    csv.appendRows(data)
    const blob = new Blob([csv.output()], {
      type: 'text/plain;charset=utf-8'
    })
    saveAs(blob, 'export.csv')
  }

  function exportTXT() {
    const { frame } = props

    if (frame.type === 'history') {
      const asTxt = frame.result
        .map((result: string) => {
          const safe = `${result}`.trim()

          if (safe.startsWith(':')) {
            return safe
          }

          return safe.endsWith(';') ? safe : `${safe};`
        })
        .join('\n\n')
      const blob = new Blob([asTxt], {
        type: 'text/plain;charset=utf-8'
      })

      saveAs(blob, 'history.txt')
    }
  }

  function exportJSON(records: any) {
    const exportData = map(records, recordToJSONMapper)
    const data = stringifyMod(exportData, stringModifier, true)
    const blob = new Blob([data], {
      type: 'text/plain;charset=utf-8'
    })
    saveAs(blob, 'records.json')
  }

  function exportPNG() {
    const { svgElement, graphElement, type } = props.visElement
    downloadPNGFromSVG(svgElement, graphElement, type)
  }

  function exportSVG() {
    const { svgElement, graphElement, type } = props.visElement
    downloadSVG(svgElement, graphElement, type)
  }

  function exportGrass(data: any) {
    const blob = new Blob([data], {
      type: 'text/plain;charset=utf-8'
    })
    saveAs(blob, 'style.grass')
  }

  /*
   * Displaying the download icon even if there is no result or visualization
   * prevents the run/stop icon from "jumping" as the download icon disappears
   * and reappears when running fast queries.
   */
  const displayDownloadIcon = () =>
    props?.frame?.type === 'cypher' || canExport()

  function canExport() {
    const { frame = {}, visElement } = props

    return (
      canExportTXT() ||
      (frame.type === 'cypher' && (hasData() || visElement)) ||
      (frame.type === 'style' && hasData())
    )
  }

  function canExportTXT() {
    const { frame = {} } = props

    return frame.type === 'history' && arrayHasItems(frame.result)
  }

  function run(cmd: string) {
    props.reRun(frame, cmd)
  }

  const { frame = {} } = props
  const fullscreenIcon = props.fullscreen ? <ContractIcon /> : <ExpandIcon />
  const expandCollapseIcon = props.collapse ? <DownIcon /> : <UpIcon />

  return (
    <StyledFrameTitleBar>
      <FeatureToggle
        name={reusableFrame}
        on={
          <FrameTitleEditorContainer data-testid="frameCommand">
            <Monaco
              history={frame.history || []}
              useDb={frame.useDb}
              enableMultiStatementMode={true}
              id={`editor-${frame.id}`}
              bus={props.bus}
              onChange={setEditorValue}
              onExecute={run}
              value={editorValue}
              ref={editorRef}
              toggleFullscreen={props.fullscreenToggle}
            />
          </FrameTitleEditorContainer>
        }
        off={
          <StyledFrameCommand
            selectedDb={frame.useDb}
            onClick={() => props.onTitlebarClick(editorValue)}
            data-testid="frameCommand"
          >
            <DottedLineHover>{editorValue}</DottedLineHover>
          </StyledFrameCommand>
        }
      />
      <StyledFrameTitlebarButtonSection>
        <FrameButton
          data-testid="rerunFrameButton"
          title="Rerun"
          onClick={() =>
            props.request?.status === REQUEST_STATUS_PENDING
              ? props.cancelQuery(frame.requestId)
              : run(editorValue)
          }
        >
          {props.request?.status === REQUEST_STATUS_PENDING ? (
            <StopIcon />
          ) : (
            <RunIcon />
          )}
        </FrameButton>
        <FrameButton
          title="Save as Favorite"
          data-testid="frame-Favorite"
          onClick={() => {
            props.newFavorite(frame.cmd)
          }}
        >
          <SaveFavorite />
        </FrameButton>
        <Render if={displayDownloadIcon()}>
          <DropdownButton data-testid="frame-export-dropdown">
            <DownloadIcon />
            <Render if={canExport()}>
              <DropdownList>
                <DropdownContent>
                  <Render if={props.isRelateAvailable}>
                    <DropdownItem
                      onClick={() => props.newProjectFile(frame.cmd)}
                    >
                      Save as project file
                    </DropdownItem>
                    <DropDownItemDivider />
                  </Render>
                  <Render if={hasData() && frame.type === 'cypher'}>
                    <DropdownItem onClick={() => exportCSV(props.getRecords())}>
                      Export CSV
                    </DropdownItem>
                    <DropdownItem
                      onClick={() => exportJSON(props.getRecords())}
                    >
                      Export JSON
                    </DropdownItem>
                  </Render>
                  <Render if={props.visElement}>
                    <DropdownItem onClick={() => exportPNG()}>
                      Export PNG
                    </DropdownItem>
                    <DropdownItem onClick={() => exportSVG()}>
                      Export SVG
                    </DropdownItem>
                  </Render>
                  <Render if={canExportTXT()}>
                    <DropdownItem onClick={exportTXT}>Export TXT</DropdownItem>
                  </Render>
                  <Render if={hasData() && frame.type === 'style'}>
                    <DropdownItem
                      data-testid="exportGrassButton"
                      onClick={() => exportGrass(props.getRecords())}
                    >
                      Export GraSS
                    </DropdownItem>
                  </Render>
                </DropdownContent>
              </DropdownList>
            </Render>
          </DropdownButton>
        </Render>
        <FrameButton
          title="Pin at top"
          onClick={() => {
            props.togglePin()
            // using frame.isPinned causes issues when there are multiple frames in one
            props.togglePinning(frame.id, props.pinned)
          }}
          pressed={props.pinned}
        >
          <PinIcon />
        </FrameButton>
        <FrameButton
          title={props.fullscreen ? 'Close fullscreen' : 'Fullscreen'}
          onClick={() => {
            props.fullscreenToggle()
            props.trackFullscreenToggle()
          }}
        >
          {fullscreenIcon}
        </FrameButton>
        <FrameButton
          title={props.collapse ? 'Expand' : 'Collapse'}
          onClick={() => {
            props.collapseToggle()
            props.trackCollapseToggle()
          }}
        >
          {expandCollapseIcon}
        </FrameButton>
        <Render if={frame.type === 'edit'}>
          <FrameButton title="Run" onClick={() => props.onRunClick()}>
            <SVGInline svg={controlsPlay} width="12px" />
          </FrameButton>
        </Render>
        <ConfirmationDialog
          confirmLabel="Yes, close frame"
          onClose={() => {
            setConfirmationDialogOpen(false)
          }}
          onConfirm={() => {
            setConfirmationDialogOpen(false)
            props.onCloseClick(frame.id, frame.requestId, props.request)
          }}
          open={confirmationDialogOpen}
        >
          <h2 style={{ fontWeight: 'normal' }}>Close frame?</h2>
          <p>
            Closing the frame cannot be undone.
            <br />
            You can access you query history by running <code>
              :history
            </code>{' '}
            command.
          </p>
          <p>Do you want to close the frame anyway?</p>
        </ConfirmationDialog>
        <FrameButton
          title="Close"
          onClick={() => {
            frame.isRerun
              ? setConfirmationDialogOpen(true)
              : props.onCloseClick(frame.id, frame.requestId, props.request)
          }}
        >
          <CloseIcon />
        </FrameButton>
      </StyledFrameTitlebarButtonSection>
    </StyledFrameTitleBar>
  )
}

const mapStateToProps = (state: any, ownProps: FrameTitleBarBaseProps) => {
  const request = ownProps.frame.requestId
    ? getRequest(state, ownProps.frame.requestId)
    : null

  return {
    request,
    isRelateAvailable: app.isRelateAvailable(state)
  }
}

const mapDispatchToProps = (
  dispatch: any,
  ownProps: FrameTitleBarBaseProps
) => {
  return {
    newFavorite: (cmd: string) => {
      dispatch(sidebar.setDraftScript(cmd, 'favorites'))
    },
    newProjectFile: (cmd: string) => {
      dispatch(sidebar.setDraftScript(cmd, 'project files'))
      dispatch({ type: TRACK_SAVE_AS_PROJECT_FILE })
    },
    trackFullscreenToggle: () => {
      dispatch({ type: TRACK_FULLSCREEN_TOGGLE })
    },
    trackCollapseToggle: () => {
      dispatch({ type: TRACK_COLLAPSE_TOGGLE })
    },
    cancelQuery: (requestId: string) => {
      dispatch(cancelRequest(requestId))
    },
    onCloseClick: async (
      id: string,
      requestId: string,
      request: BrowserRequest | null
    ) => {
      if (request && request.status === REQUEST_STATUS_PENDING) {
        dispatch(cancelRequest(requestId))
        await sleep(3000) // sleep for 3000 ms to let user read the cancel info
      }
      dispatch(remove(id))
    },
    onRunClick: () => {
      ownProps.runQuery()
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
    togglePinning: (id: string, isPinned: boolean) => {
      isPinned ? dispatch(unpin(id)) : dispatch(pin(id))
    },
    onTitlebarClick: (cmd: any) => {
      ownProps.bus.send(editor.SET_CONTENT, editor.setContent(cmd))
    }
  }
}

export default withBus(
  connect(mapStateToProps, mapDispatchToProps)(FrameTitlebar)
)
