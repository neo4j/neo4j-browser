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
import React, { memo, useRef, useEffect, useState } from 'react'
import {
  StyledStream,
  Padding,
  AnimationContainer,
  DropdownButton,
  DropdownList,
  DropdownContent,
  DropDownItemDivider
} from './styled'
import CypherFrame from './CypherFrame/CypherFrame'
import HistoryFrame from './HistoryFrame'
import PlayFrame from './PlayFrame'
import DefaultFrame from '../Frame/DefaultFrame'
import PreFrame from './PreFrame'
import ParamsFrame from './ParamsFrame'
import ErrorFrame from './ErrorFrame'
import HelpFrame from './HelpFrame'
import CypherScriptFrame from './CypherScriptFrame/CypherScriptFrame'
import SchemaFrame from './SchemaFrame'
import StyleFrame from './StyleFrame'
import SysInfoFrame from './SysInfoFrame'
import ConnectionFrame from './Auth/ConnectionFrame'
import DisconnectFrame from './Auth/DisconnectFrame'
import ServerStatusFrame from './Auth/ServerStatusFrame'
import ServerSwitchFrame from './Auth/ServerSwitchFrame'
import UseDbFrame from './Auth/UseDbFrame'
import ChangePasswordFrame from './Auth/ChangePasswordFrame'
import QueriesFrame from './Queries/QueriesFrame'
import UserList from '../User/UserList'
import UserAdd from '../User/UserAdd'
import { GlobalState } from 'shared/globalState'
import { FrameStack, Frame, getFrames } from 'shared/modules/stream/streamDuck'
import {
  getActiveConnectionData,
  Connection
} from 'shared/modules/connections/connectionsDuck'
import { getScrollToTop } from 'shared/modules/settings/settingsDuck'
import DbsFrame from './Auth/DbsFrame'
import { StyledFrame } from '../Frame/styled'
import FrameTitlebar from '../Frame/FrameTitlebar'
import { dim } from 'browser-styles/constants'
import styled from 'styled-components'
import {
  recordToJSONMapper,
  stringifyResultArray,
  transformResultRecordsToResultArray
} from './CypherFrame/helpers'
import { csvFormat, stringModifier } from 'services/bolt/cypherTypesFormatting'
import { CSVSerializer } from 'services/serializer'
import { stringifyMod } from 'services/utils'
import { map } from 'lodash'
import { downloadPNGFromSVG, downloadSVG } from 'services/exporting/imageUtils'
import { DownloadIcon } from 'browser-components/icons/Icons'
import { DropdownItem } from 'semantic-ui-react'

const trans: Record<string, React.ComponentType<any>> = {
  error: ErrorFrame,
  cypher: CypherFrame,
  'cypher-script': CypherScriptFrame,
  'user-list': UserList,
  'user-add': UserAdd,
  'change-password': ChangePasswordFrame,
  pre: PreFrame,
  play: PlayFrame,
  'play-remote': PlayFrame,
  history: HistoryFrame,
  param: ParamsFrame,
  params: ParamsFrame,
  connection: ConnectionFrame,
  disconnect: DisconnectFrame,
  schema: SchemaFrame,
  help: HelpFrame,
  queries: QueriesFrame,
  sysinfo: SysInfoFrame,
  status: ServerStatusFrame,
  'switch-success': ServerSwitchFrame,
  'switch-fail': ServerSwitchFrame,
  'use-db': UseDbFrame,
  'reset-db': UseDbFrame,
  dbs: DbsFrame,
  style: StyleFrame,
  default: DefaultFrame
}

const getFrameComponent = (frameData: FrameStack): React.ComponentType<any> => {
  const { cmd, type } = frameData.stack[0]
  let MyFrame = trans[type] || trans.default

  if (type === 'error') {
    try {
      const command = cmd.replace(/^:/, '')
      const Frame = command[0].toUpperCase() + command.slice(1) + 'Frame'
      MyFrame = require('./Extras/index')[Frame] || trans['error']
    } catch (e) {}
  }
  return MyFrame
}

type StreamProps = {
  frames: FrameStack[]
  activeConnectionData: Connection | null
  shouldScrollToTop: boolean
}

export interface BaseFrameProps {
  frame: Frame
  activeConnectionData: Connection | null
  stack: Frame[]
}

function Stream(props: StreamProps): JSX.Element {
  const base = useRef<HTMLDivElement>(null)
  const lastFrameCount = useRef(0)

  useEffect(() => {
    // If we want to scroll to top when a new frame is added
    if (
      lastFrameCount.current < props.frames.length &&
      props.shouldScrollToTop &&
      base.current
    ) {
      base.current.scrollTop = 0
    }

    lastFrameCount.current = props.frames.length
  })

  return (
    <StyledStream ref={base} data-testid="stream">
      {props.frames.map(frameObject => (
        <AnimationContainer key={frameObject.stack[0].id}>
          <FrameContainer
            frameData={frameObject}
            activeConnectionData={props.activeConnectionData}
          />
        </AnimationContainer>
      ))}
      <Padding />
    </StyledStream>
  )
}

// TODO Hämta active connection själv
type FrameContainerProps = {
  frameData: FrameStack
  activeConnectionData: Connection | null
}

function FrameContainer(props: FrameContainerProps) {
  const {
    isFullscreen,
    toggleFullscreen,
    isCollapsed,
    toggleCollapse
  } = useSizeToggles()
  const frame = props.frameData.stack[0]
  const frameProps: BaseFrameProps = {
    frame,
    activeConnectionData: props.activeConnectionData,
    stack: props.frameData.stack
  }
  const FrameComponent = getFrameComponent(props.frameData)

  // refactor away classnames like is-fullscreen and so on
  // TODO refactor away need for content to know if it's fullscreen or not. right now they look ugly
  // TODO exporting.
  // TODO BaseFrameProps är fuckt också varför behöver de veta om pinned.

  return (
    <StyledFrame
      className={isFullscreen ? 'is-fullscreen' : ''}
      data-testid="frame"
      fullscreen={isFullscreen}
    >
      <FrameTitlebar
        frame={frame}
        isPinned={props.frameData.isPinned}
        fullscreen={isFullscreen}
        fullscreenToggle={toggleFullscreen}
        collapse={isCollapsed}
        collapseToggle={toggleCollapse}
        //extraButtons={<ExtraTitleBarButtons />}
      />
      <ContentContainer isCollapsed={isCollapsed} isFullscreen={isFullscreen}>
        <FrameComponent {...frameProps} />
      </ContentContainer>
    </StyledFrame>
  )
}

function exportCSV(records: any) {
  // TODO check for issues in the exported csv, doesn't have headers?
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

function exportHistory(frame: Frame) {
  // TODO move to util functions
  // Typing of result is wrong for history frame.
  const asTxt = ((frame.result as unknown) as string[])
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

function exportJSON(records: any) {
  const exportData = map(records, recordToJSONMapper)
  const data = stringifyMod(exportData, stringModifier, true)
  const blob = new Blob([data], {
    type: 'text/plain;charset=utf-8'
  })
  saveAs(blob, 'records.json')
}

function exportPNG(visElement: any) {
  const { svgElement, graphElement, type } = visElement
  downloadPNGFromSVG(svgElement, graphElement, type)
}

function exportSVG(visElement: any) {
  const { svgElement, graphElement, type } = visElement
  downloadSVG(svgElement, graphElement, type)
}

function exportGrass(data: string) {
  const blob = new Blob([data], {
    type: 'text/plain;charset=utf-8'
  })
  saveAs(blob, 'style.grass')
}

//TODO frame arg from all meethods

type ExportButtonsProps = {
  frame: Frame
  isRelateAvailable: boolean
  newProjectFile: (name: string) => void
}

function ExportButtons({
  frame,
  isRelateAvailable,
  newProjectFile
}: ExportButtonsProps) {
  const exportable = frame.exportable || []
  const canExport: boolean = exportable.length > 0 || isRelateAvailable

  return (
    canExport && (
      <DropdownButton data-testid="frame-export-dropdown">
        <DownloadIcon />
        <DropdownList>
          <DropdownContent>
            {isRelateAvailable && (
              <DropdownItem onClick={() => newProjectFile(frame.cmd)}>
                Save as project file
              </DropdownItem>
            )}

            <DropDownItemDivider />
            {exportable.map(({ name, exportData }) => (
              <DropdownItem
                data-testid={`export${name}Button`}
                onClick={exportData}
                key={name}
              >
                Export {name}
              </DropdownItem>
            ))}

            {frame.type === 'cypher' && (
              <>
                <DropdownItem onClick={() => exportCSV(getRecords())}>
                  Export CSV
                </DropdownItem>
                <DropdownItem onClick={() => exportJSON(getRecords())}>
                  Export JSON
                </DropdownItem>
              </>
            )}

            {visElement && (
              <>
                <DropdownItem onClick={() => exportPNG()}>
                  Export PNG
                </DropdownItem>
                <DropdownItem onClick={() => exportSVG()}>
                  Export SVG
                </DropdownItem>
              </>
            )}

            {frame.type === 'history' && (
              <DropdownItem onClick={exportHistory}>Export TXT</DropdownItem>
            )}

            {frame.type === 'style' && (
              <DropdownItem
                data-testid="exportGrassButton"
                onClick={() => exportGrass(getRecords())}
              >
                Export GraSS
              </DropdownItem>
            )}
          </DropdownContent>
        </DropdownList>
      </DropdownButton>
    )
  )
}

const ContentContainer = styled.div<{
  isCollapsed: boolean
  isFullscreen: boolean
}>`
  overflow: auto;
  max-height: ${props => {
    if (props.isCollapsed) {
      return 0
    }
    if (props.isFullscreen) {
      return '100%'
    }
    return dim.frameBodyHeight - dim.frameStatusbarHeight + 1 + 'px'
  }};
`

function useSizeToggles() {
  const [isCollapsed, setCollapsed] = useState(false)
  const [isFullscreen, setFullscreen] = useState(false)

  function toggleCollapse() {
    setCollapsed(coll => !coll)
    setFullscreen(false)
  }

  function toggleFullscreen() {
    setFullscreen(full => !full)
    setCollapsed(false)
  }

  return {
    isCollapsed,
    isFullscreen,
    toggleCollapse,
    toggleFullscreen
  }
}

const mapStateToProps = (state: GlobalState) => ({
  frames: getFrames(state),
  activeConnectionData: getActiveConnectionData(state),
  shouldScrollToTop: getScrollToTop(state)
})

export default connect(mapStateToProps)(memo(Stream))
