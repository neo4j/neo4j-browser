import React from 'react'
import { connect } from 'react-redux'
import editor from '../../editor'
import { remove } from '../actions'

const FrameTitlebarComponent = ({frame, onTitlebarClick, onCloseClick, onReRunClick}) => {
  return (
    <div className='frame-titlebar'>
      <div className='frame-command'>
        <span onClick={() => onTitlebarClick(frame.id)} className='frame-titlebar-cmd'>{frame.cmd}</span>
      </div>
      <div className='frame-action-buttons'>
        <div onClick={() => onReRunClick(frame.cmd, frame.id)} className='frame-action-button'>Re-run</div>
        <div onClick={() => onCloseClick(frame.id)} className='frame-action-button'>X</div>
      </div>
      <div className='clear'></div>
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

const FrameTitlebar = connect(null, mapDispatchToProps)(FrameTitlebarComponent)

export {
  FrameTitlebar
}
