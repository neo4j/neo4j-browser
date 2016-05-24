import React from 'react'
import editor from '../../editor'
import { connect } from 'react-redux'

const FrameTitlebarComponent = ({frame, onCmdClick}) => {
  return (
    <div className='frame-titlebar'>
      <span onClick={() => onCmdClick(frame.cmd)} className='frame-titlebar-cmd'>{frame.cmd}</span>
    </div>
  )
}

const mapDispatchToProps = (dispatch) => {
  return {
    onCmdClick: (cmd) => {
      dispatch(editor.actions.setContent(cmd))
    }
  }
}

const FrameTitlebar = connect(null, mapDispatchToProps)(FrameTitlebarComponent)

export {
  FrameTitlebar,
  FrameTitlebarComponent
}
