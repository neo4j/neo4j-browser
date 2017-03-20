import { connect } from 'preact-redux'
import { withBus } from 'preact-suber'
import * as editor from 'shared/modules/editor/editorDuck'
import * as commands from 'shared/modules/commands/commandsDuck'
import { cancel as cancelRequest } from 'shared/modules/requests/requestsDuck'
import { remove, pin, unpin } from 'shared/modules/stream/streamDuck'
import { FrameButton } from 'browser-components/buttons'
import { ExpandIcon, ContractIcon, RefreshIcon, CloseIcon, UpIcon, DownIcon, PinIcon } from 'browser-components/icons/Icons'
import { StyledFrameTitleBar, StyledFrameCommand, FrameTitlebarButtonSection } from './styled'

export const FrameTitlebar = ({frame, fullscreen, togglePinning, fullscreenToggle, collapse, collapseToggle, onTitlebarClick, onCloseClick, onReRunClick, onExpandClick}) => {
  const fullscreenIcon = (fullscreen) ? <ContractIcon /> : <ExpandIcon />
  const expandCollapseIcon = (collapse) ? <DownIcon /> : <UpIcon />
  return (
    <StyledFrameTitleBar>
      <StyledFrameCommand onClick={() => onTitlebarClick(frame.cmd)}>
        {frame.cmd}
      </StyledFrameCommand>
      <FrameTitlebarButtonSection>
        <FrameButton onClick={() => togglePinning(frame.id, frame.isPinned)}><PinIcon /></FrameButton>
        <FrameButton onClick={() => fullscreenToggle()}>{fullscreenIcon}</FrameButton>
        <FrameButton onClick={() => collapseToggle()}>{expandCollapseIcon}</FrameButton>
        <FrameButton onClick={() => onReRunClick(frame.cmd, frame.id, frame.requestId)}><RefreshIcon /></FrameButton>
        <FrameButton onClick={() => onCloseClick(frame.id, frame.requestId)}><CloseIcon /></FrameButton>
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
