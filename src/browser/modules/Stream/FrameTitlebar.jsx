import { connect } from 'react-redux'
import { withBus } from 'preact-suber'
import * as editor from 'shared/modules/editor/editorDuck'
import * as commands from 'shared/modules/commands/commandsDuck'
import { cancel as cancelRequest } from 'shared/modules/requests/requestsDuck'
import { remove, pin, unpin } from 'shared/modules/stream/streamDuck'
import { FrameButton } from 'browser-components/buttons'
import { ExpandIcon, ContractIcon, RefreshIcon, CloseIcon, UpIcon, DownIcon, PinIcon } from 'browser-components/icons/Icons'

import styles from './style_titlebar.css'

export const FrameTitlebar = ({frame, fullscreen, togglePinning, fullscreenToggle, collapse, collapseToggle, onTitlebarClick, onCloseClick, onReRunClick, onExpandClick}) => {
  const fullscreenIcon = (fullscreen) ? <ContractIcon /> : <ExpandIcon />
  const expandCollapseIcon = (collapse) ? <DownIcon /> : <UpIcon />
  return (
    <div>
      <label onClick={() => onTitlebarClick(frame.cmd)} className={styles['frame-command']}>
        {frame.cmd}
      </label>
      <span>
        <FrameButton icon={<PinIcon />} onClick={() => togglePinning(frame.id, frame.isPinned)} />
        <FrameButton icon={fullscreenIcon} onClick={() => fullscreenToggle()} />
        <FrameButton icon={expandCollapseIcon} onClick={() => collapseToggle()} />
        <FrameButton icon={<RefreshIcon />} onClick={() => onReRunClick(frame.cmd, frame.id, frame.requestId)} />
        <FrameButton icon={<CloseIcon />} onClick={() => onCloseClick(frame.id, frame.requestId)} />
      </span>
    </div>
  )
}

const mapDispatchToProps = (dispatch, ownProps = {}) => {
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
