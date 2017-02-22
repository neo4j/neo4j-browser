import React from 'react'
import { connect } from 'react-redux'
import { withBus } from 'react-suber'
import * as editor from 'shared/modules/editor/editorDuck'
import * as commands from 'shared/modules/commands/commandsDuck'
import { cancel as cancelRequest } from 'shared/modules/requests/requestsDuck'
import { remove } from 'shared/modules/stream/streamDuck'

import Button from 'grommet/components/Button'
import Box from 'grommet/components/Box'
import UpIcon from 'grommet/components/icons/base/Up'
import DownIcon from 'grommet/components/icons/base/Down'
import ExpandIcon from 'grommet/components/icons/base/Expand'
import ContractIcon from 'grommet/components/icons/base/Contract'
import RefreshIcon from 'grommet/components/icons/base/Refresh'
import CloseIcon from 'grommet/components/icons/base/Close'
import Header from 'grommet/components/Header'
import Label from 'grommet/components/Label'

import styles from './style_titlebar.css'

export const FrameTitlebar = ({frame, fullscreen, fullscreenToggle, collapse, collapseToggle, onTitlebarClick, onCloseClick, onReRunClick, onExpandClick}) => {
  const fullscreenIcon = (fullscreen) ? <ContractIcon /> : <ExpandIcon />
  const expandCollapseIcon = (collapse) ? <DownIcon /> : <UpIcon />
  return (
    <Header>
      <Label size='small' onClick={() => onTitlebarClick(frame.cmd)} className={styles['frame-command']}>
        {frame.cmd}
      </Label>
      <Box flex
        justify='end'
        direction='row'
        responsive={false}>
        <Button icon={fullscreenIcon} onClick={() => fullscreenToggle()} />
        <Button icon={expandCollapseIcon} onClick={() => collapseToggle()} />
        <Button icon={<RefreshIcon />} onClick={() => onReRunClick(frame.cmd, frame.id, frame.requestId)} />
        <Button icon={<CloseIcon />} onClick={() => onCloseClick(frame.id, frame.requestId)} />
      </Box>
    </Header>
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
