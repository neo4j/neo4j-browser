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

import { connect } from 'react-redux'
import React, { Component } from 'react'
import { withBus } from 'react-suber'
import { saveAs } from 'file-saver'
import { map } from 'lodash-es'

import * as editor from 'shared/modules/editor/editorDuck'
import * as commands from 'shared/modules/commands/commandsDuck'
import {
  cancel as cancelRequest,
  getRequest,
  REQUEST_STATUS_PENDING
} from 'shared/modules/requests/requestsDuck'
import { remove, pin, unpin } from 'shared/modules/stream/streamDuck'
import { removeComments, sleep } from 'shared/services/utils'
import { FrameButton } from 'browser-components/buttons'
import Render from 'browser-components/Render'
import { CSVSerializer } from 'services/serializer'
import {
  ExpandIcon,
  ContractIcon,
  RefreshIcon,
  CloseIcon,
  UpIcon,
  DownIcon,
  PinIcon,
  DownloadIcon
} from 'browser-components/icons/Icons'
import {
  DottedLineHover,
  DropdownList,
  DropdownContent,
  DropdownButton,
  DropdownItem
} from '../Stream/styled'
import {
  StyledFrameTitleBar,
  StyledFrameTitlebarButtonSection,
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
import { csvFormat } from 'services/bolt/cypherTypesFormatting'
import arrayHasItems from 'shared/utils/array-has-items'

const JSON_EXPORT_INDENT = 2

class FrameTitlebar extends Component {
  hasData() {
    return this.props.numRecords > 0
  }

  exportCSV(records) {
    const exportData = stringifyResultArray(
      csvFormat,
      transformResultRecordsToResultArray(records)
    )
    const data = exportData.slice()
    const csv = CSVSerializer(data.shift())
    csv.appendRows(data)
    var blob = new Blob([csv.output()], {
      type: 'text/plain;charset=utf-8'
    })
    saveAs(blob, 'export.csv')
  }

  exportTXT = () => {
    const { frame } = this.props

    if (frame.type === 'history') {
      const asTxt = frame.result
        .map(result => {
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

  exportJSON(records) {
    const data = JSON.stringify(
      map(records, recordToJSONMapper),
      null,
      JSON_EXPORT_INDENT
    )
    const blob = new Blob([data], {
      type: 'text/plain;charset=utf-8'
    })

    saveAs(blob, 'records.json')
  }

  exportPNG() {
    const { svgElement, graphElement, type } = this.props.visElement
    downloadPNGFromSVG(svgElement, graphElement, type)
  }

  exportSVG() {
    const { svgElement, graphElement, type } = this.props.visElement
    downloadSVG(svgElement, graphElement, type)
  }

  exportGrass(data) {
    var blob = new Blob([data], {
      type: 'text/plain;charset=utf-8'
    })
    saveAs(blob, 'style.grass')
  }

  canExport = () => {
    const props = this.props
    const { frame = {} } = props

    return (
      this.canExportTXT() ||
      (frame.type === 'cypher' && (this.hasData() || this.props.visElement)) ||
      (frame.type === 'style' && this.hasData())
    )
  }

  canExportTXT() {
    const { frame = {} } = this.props

    return frame.type === 'history' && arrayHasItems(frame.result)
  }

  render() {
    const props = this.props
    const { frame = {} } = props
    const fullscreenIcon = props.fullscreen ? <ContractIcon /> : <ExpandIcon />
    const expandCollapseIcon = props.collapse ? <DownIcon /> : <UpIcon />
    const cmd = removeComments(frame.cmd)
    return (
      <StyledFrameTitleBar>
        <StyledFrameCommand selectedDb={frame.useDb}>
          <DottedLineHover
            data-testid="frameCommand"
            onClick={() => props.onTitlebarClick(frame.cmd)}
          >
            {cmd}
          </DottedLineHover>
        </StyledFrameCommand>
        <StyledFrameTitlebarButtonSection>
          <Render if={this.canExport()}>
            <DropdownButton data-testid="frame-export-dropdown">
              <DownloadIcon />
              <DropdownList>
                <DropdownContent>
                  <Render if={this.hasData() && frame.type === 'cypher'}>
                    <DropdownItem
                      onClick={() => this.exportCSV(props.getRecords())}
                    >
                      Export CSV
                    </DropdownItem>
                    <DropdownItem
                      onClick={() => this.exportJSON(props.getRecords())}
                    >
                      Export JSON
                    </DropdownItem>
                  </Render>
                  <Render if={props.visElement}>
                    <DropdownItem onClick={() => this.exportPNG()}>
                      Export PNG
                    </DropdownItem>
                    <DropdownItem onClick={() => this.exportSVG()}>
                      Export SVG
                    </DropdownItem>
                  </Render>
                  <Render if={this.canExportTXT()}>
                    <DropdownItem onClick={this.exportTXT}>
                      Export TXT
                    </DropdownItem>
                  </Render>
                  <Render if={this.hasData() && frame.type === 'style'}>
                    <DropdownItem
                      data-testid="exportGrassButton"
                      onClick={() => this.exportGrass(props.getRecords())}
                    >
                      Export GraSS
                    </DropdownItem>
                  </Render>
                </DropdownContent>
              </DropdownList>
            </DropdownButton>
          </Render>
          <FrameButton
            title="Pin at top"
            onClick={() => {
              props.togglePin()
              props.togglePinning(frame.id, frame.isPinned)
            }}
            pressed={props.pinned}
          >
            <PinIcon />
          </FrameButton>
          <Render
            if={['cypher', 'play', 'play-remote', 'queries'].includes(
              frame.type
            )}
          >
            <FrameButton
              title={props.fullscreen ? 'Close fullscreen' : 'Fullscreen'}
              onClick={() => props.fullscreenToggle()}
            >
              {fullscreenIcon}
            </FrameButton>
          </Render>
          <FrameButton
            title={props.collapse ? 'Expand' : 'Collapse'}
            onClick={() => props.collapseToggle()}
          >
            {expandCollapseIcon}
          </FrameButton>
          <Render if={['cypher', 'style', 'schema'].includes(frame.type)}>
            <FrameButton
              data-testid="rerunFrameButton"
              title="Rerun"
              onClick={() =>
                props.onReRunClick(frame.cmd, frame.id, frame.requestId)
              }
            >
              <RefreshIcon />
            </FrameButton>
          </Render>
          <FrameButton
            title="Close"
            onClick={() =>
              props.onCloseClick(frame.id, frame.requestId, props.request)
            }
          >
            <CloseIcon />
          </FrameButton>
        </StyledFrameTitlebarButtonSection>
      </StyledFrameTitleBar>
    )
  }
}

const mapStateToProps = (state, ownProps) => {
  const request = ownProps.frame.requestId
    ? getRequest(state, ownProps.frame.requestId)
    : null

  return {
    request
  }
}

const mapDispatchToProps = (dispatch, ownProps) => {
  return {
    onTitlebarClick: cmd => {
      ownProps.bus.send(editor.SET_CONTENT, editor.setContent(cmd))
    },
    onCloseClick: async (id, requestId, request) => {
      if (request && request.status === REQUEST_STATUS_PENDING) {
        dispatch(cancelRequest(requestId))
        await sleep(3000) // sleep for 3000 ms to let user read the cancel info
      }
      dispatch(remove(id))
    },
    onReRunClick: (cmd, id, requestId) => {
      if (requestId) {
        dispatch(cancelRequest(requestId))
      }
      dispatch(commands.executeCommand(cmd, id))
    },
    togglePinning: (id, isPinned) => {
      isPinned ? dispatch(unpin(id)) : dispatch(pin(id))
    }
  }
}

export default withBus(
  connect(mapStateToProps, mapDispatchToProps)(FrameTitlebar)
)
