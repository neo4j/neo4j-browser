/*
 * Copyright (c) 2002-2017 "Neo Technology,"
 * Network Engine for Objects in Lund AB [http://neotechnology.com]
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

import { connect } from 'preact-redux'
import { Component } from 'preact'
import { withBus } from 'preact-suber'
import * as editor from 'shared/modules/editor/editorDuck'
import * as commands from 'shared/modules/commands/commandsDuck'
import { cancel as cancelRequest } from 'shared/modules/requests/requestsDuck'
import { remove, pin, unpin } from 'shared/modules/stream/streamDuck'
import { removeComments } from 'shared/services/utils'
import { FrameButton, FrameButtonAChild } from 'browser-components/buttons'
import Visible from 'browser-components/Visible'
import { CSVSerializer } from 'services/serializer'
import { ExpandIcon, ContractIcon, RefreshIcon, CloseIcon, UpIcon, DownIcon, PinIcon, DownloadIcon } from 'browser-components/icons/Icons'
import { StyledFrameTitleBar, StyledFrameCommand, DottedLineHover, FrameTitlebarButtonSection } from './styled'

const getCsvData = (exportData) => {
  if (exportData && exportData.length > 0) {
    let data = exportData.slice()
    const csv = CSVSerializer(data.shift())
    csv.appendRows(data)
    return 'data:text/csv;charset=utf-8,' + encodeURIComponent(csv.output())
  } else {
    return null
  }
}

class FrameTitlebar extends Component {
  constructor (props) {
    super(props)
    this.state = {
      csvData: props.exportData && getCsvData(props.exportData)
    }
  }

  componentWillReceiveProps (nextProps) {
    if (this.props.exportData !== nextProps.exportData) {
      this.setState({csvData: nextProps.exportData ? getCsvData(nextProps.exportData) : null})
    }
  }

  render () {
    let props = this.props
    const { frame } = props
    const fullscreenIcon = (props.fullscreen) ? <ContractIcon /> : <ExpandIcon />
    const expandCollapseIcon = (props.collapse) ? <DownIcon /> : <UpIcon />
    const cmd = removeComments(frame.cmd)
    return (
      <StyledFrameTitleBar>
        <StyledFrameCommand>
          <DottedLineHover onClick={() => props.onTitlebarClick(cmd)}>
            {cmd}
          </DottedLineHover>
        </StyledFrameCommand>
        <FrameTitlebarButtonSection>
          <Visible if={frame.type === 'cypher' && props.exportData}>
            <FrameButton><FrameButtonAChild download='export.csv' href={this.state.csvData}><DownloadIcon /></FrameButtonAChild></FrameButton>
          </Visible>
          <FrameButton onClick={() => {
            props.togglePin()
            props.togglePinning(frame.id, frame.isPinned)
          }} pressed={props.pinned}><PinIcon /></FrameButton>
          <Visible if={frame.type === 'cypher'}>
            <FrameButton onClick={() => props.fullscreenToggle()}>{fullscreenIcon}</FrameButton>
          </Visible>
          <FrameButton onClick={() => props.collapseToggle()}>{expandCollapseIcon}</FrameButton>
          <Visible if={frame.type === 'cypher'}>
            <FrameButton onClick={() => props.onReRunClick(frame.cmd, frame.id, frame.requestId)}><RefreshIcon /></FrameButton>
          </Visible>
          <FrameButton onClick={() => props.onCloseClick(frame.id, frame.requestId)}><CloseIcon /></FrameButton>
        </FrameTitlebarButtonSection>
      </StyledFrameTitleBar>
    )
  }
}

const mapDispatchToProps = (dispatch, ownProps) => {
  return {
    onTitlebarClick: (cmd) => {
      ownProps.bus.send(editor.SET_CONTENT, editor.setContent(cmd))
    },
    onCloseClick: (id, requestId) => {
      if (requestId) dispatch(cancelRequest(requestId))
      dispatch(remove(id))
    },
    onReRunClick: (cmd, id, requestId) => {
      if (requestId) dispatch(cancelRequest(requestId))
      dispatch(commands.executeCommand(cmd, id))
    },
    togglePinning: (id, isPinned) => {
      isPinned
        ? dispatch(unpin(id))
        : dispatch(pin(id))
    }
  }
}

export default withBus(connect(null, mapDispatchToProps)(FrameTitlebar))
