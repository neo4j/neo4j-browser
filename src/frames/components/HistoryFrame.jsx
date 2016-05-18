import React from 'react'
import { connect } from 'react-redux'
import editor from '../../editor'
import { HistoryRowComponent } from './HistoryRow'

const HistoryFrameComponent = ({frame, onHistoryClick}) => {
  const historyRows = frame.history.map((entry, index) => {
    return <HistoryRowComponent key={index} handleEntryClick={onHistoryClick} entry={entry}/>
  })
  return <div className='frame'><ul className='history-list'>{historyRows}</ul></div>
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
