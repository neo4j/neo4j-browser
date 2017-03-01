import React from 'react'
import { connect } from 'react-redux'
import { withBus } from 'react-suber'
import * as editor from 'shared/modules/editor/editorDuck'
import * as commands from 'shared/modules/commands/commandsDuck'
import { cancel as cancelRequest } from 'shared/modules/requests/requestsDuck'
import { remove } from 'shared/modules/stream/streamDuck'
import { FrameButton } from 'nbnmui/buttons'
import ExpandIcon from 'grommet/components/icons/base/Expand'
import ContractIcon from 'grommet/components/icons/base/Contract'
import RefreshIcon from 'grommet/components/icons/base/Refresh'
import CloseIcon from 'grommet/components/icons/base/Close'

import styles from './style_titlebar.css'

export const FrameTitlebar = ({frame, fullscreen, fullscreenToggle, onTitlebarClick, onCloseClick, onReRunClick, onExpandClick}) => {
  const fullscreenIcon = (fullscreen) ? <ContractIcon /> : <ExpandIcon />
  return (
    <div>
      <label onClick={() => onTitlebarClick(frame.cmd)} className={styles['frame-command']}>
        {frame.cmd}
      </label>
      <span>
        <FrameButton icon={fullscreenIcon} onClick={() => fullscreenToggle()} />
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
    }
  }
}

export default withBus(connect(null, mapDispatchToProps)(FrameTitlebar))
