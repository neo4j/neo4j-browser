import React from 'react'
import { connect } from 'react-redux'
import { withBus } from 'react-suber'
import * as editor from 'shared/modules/editor/editorDuck'
import * as commands from 'shared/modules/commands/commandsDuck'
import { remove } from 'shared/modules/stream/streamDuck'

import Button from 'grommet/components/Button'
import Box from 'grommet/components/Box'
import RefreshIcon from 'grommet/components/icons/base/Refresh'
import CloseIcon from 'grommet/components/icons/base/Close'
import Header from 'grommet/components/Header'
import Label from 'grommet/components/Label'

import styles from './style_titlebar.css'

export const FrameTitlebar = ({frame, onTitlebarClick, onCloseClick, onReRunClick}) => {
  return (
    <Header>
      <Label size='small' onClick={() => onTitlebarClick(frame.cmd)} className={styles['frame-command']}>
        {frame.cmd}
      </Label>
      <Box flex
        justify='end'
        direction='row'
        responsive={false}>
        <Button icon={<RefreshIcon />} onClick={() => onReRunClick(frame.cmd, frame.id)} />
        <Button icon={<CloseIcon />} onClick={() => onCloseClick(frame.id)} />
      </Box>
    </Header>
  )
}

const mapDispatchToProps = (dispatch, ownProps = {}) => {
  return {
    onTitlebarClick: (cmd) => {
      ownProps.bus.send(editor.SET_CONTENT, editor.setContent(cmd))
    },
    onCloseClick: (id) => {
      dispatch(remove(id))
    },
    onReRunClick: (cmd, id) => {
      dispatch(commands.executeCommand(cmd, id))
    }
  }
}

export default withBus(connect(null, mapDispatchToProps)(FrameTitlebar))
