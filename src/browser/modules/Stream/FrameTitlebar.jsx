import React from 'react'
import { connect } from 'react-redux'
import editor from 'containers/editor'
import { remove } from '../actions'

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

const mapDispatchToProps = (dispatch) => {
  return {
    onTitlebarClick: (cmd) => {
      dispatch(editor.actions.setContent(cmd))
    },
    onCloseClick: (id) => {
      dispatch(remove(id))
    },
    onReRunClick: (cmd, id) => {
      dispatch(editor.actions.executeCommand(cmd, id))
    }
  }
}

export default connect(null, mapDispatchToProps)(FrameTitlebar)
