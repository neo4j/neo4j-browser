import { connect } from 'preact-redux'
import { withBus } from 'preact-suber'
import * as editor from 'shared/modules/editor/editorDuck'
import * as commands from 'shared/modules/commands/commandsDuck'
import { cancel as cancelRequest } from 'shared/modules/requests/requestsDuck'
import { remove, pin, unpin } from 'shared/modules/stream/streamDuck'
import { FrameButton, FrameButtonAChild } from 'browser-components/buttons'
import Visible from 'browser-components/Visible'
import { CSVSerializer } from 'services/serializer'
import { ExpandIcon, ContractIcon, RefreshIcon, CloseIcon, UpIcon, DownIcon, PinIcon, DownloadIcon } from 'browser-components/icons/Icons'
import { StyledFrameTitleBar, StyledFrameCommand, FrameTitlebarButtonSection } from './styled'

export const FrameTitlebar = (props) => {
  const { frame } = props
  let csvData = null
  if (props.exportData) {
    let data = props.exportData
    const csv = CSVSerializer(data.shift())
    csv.appendRows(data)
    csvData = 'data:text/csv;charset=utf-8,' + encodeURIComponent(csv.output())
  }
  const fullscreenIcon = (props.fullscreen) ? <ContractIcon /> : <ExpandIcon />
  const expandCollapseIcon = (props.collapse) ? <DownIcon /> : <UpIcon />
  return (
    <StyledFrameTitleBar>
      <StyledFrameCommand onClick={() => props.onTitlebarClick(frame.cmd)}>
        {frame.cmd}
      </StyledFrameCommand>
      <FrameTitlebarButtonSection>
        <Visible if={frame.type === 'cypher' && csvData}>
          <FrameButton><FrameButtonAChild download='export.csv' href={csvData}><DownloadIcon /></FrameButtonAChild></FrameButton>
        </Visible>
        <FrameButton onClick={() => props.togglePinning(frame.id, frame.isPinned)}><PinIcon /></FrameButton>
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
