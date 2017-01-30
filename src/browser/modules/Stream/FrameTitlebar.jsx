import React from 'react'
import { connect } from 'react-redux'
import { withBus } from 'react-suber'
import * as editor from 'shared/modules/editor/editorDuck'
import * as commands from 'shared/modules/commands/commandsDuck'
import { remove } from 'shared/modules/stream/streamDuck'

import styles from './style_titlebar.css'

export const FrameTitlebar = ({frame, onTitlebarClick, onCloseClick, onReRunClick}) => {
  return (
    <div className={styles['frame-titlebar']}>
      <div className={styles['frame-command']}>
        <span onClick={() => onTitlebarClick(frame.cmd)} className={styles['frame-titlebar-cmd']}>{frame.cmd}</span>
      </div>
      <div className='frame-action-buttons'>
        <div onClick={() => onReRunClick(frame.cmd, frame.id)} className={styles['frame-action-button']}>Re-run</div>
        <div onClick={() => onCloseClick(frame.id)} className={styles['frame-action-button']}>X</div>
      </div>
      <div className='clear' />
    </div>
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

export default connect(null, mapDispatchToProps)(withBus(FrameTitlebar))
