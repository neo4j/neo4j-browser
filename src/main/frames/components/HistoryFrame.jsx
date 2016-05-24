import React from 'react'
import { connect } from 'react-redux'
import { FrameTitlebar } from './FrameTitlebar'
import editor from '../../editor'
import { HistoryRowComponent } from './HistoryRow'

const HistoryFrameComponent = ({frame, onHistoryClick, handleTitlebarClick}) => {
  const historyRows = frame.history.map((entry, index) => {
    return <HistoryRowComponent key={index} handleEntryClick={onHistoryClick} entry={entry}/>
  })
  return (
    <div className='frame'>
      <FrameTitlebar handleTitlebarClick={() => handleTitlebarClick(frame.cmd)} frame={frame} />
      <div className='frame-contents'><ul className='history-list'>{historyRows}</ul></div>
    </div>
  )
}

const mapDispatchToProps = (dispatch) => {
  return {
    onHistoryClick: (cmd) => {
      dispatch(editor.actions.setContent(cmd))
    }
  }
}

const HistoryFrame = connect(null, mapDispatchToProps)(HistoryFrameComponent)

export {
  HistoryFrameComponent,
  HistoryFrame
}
