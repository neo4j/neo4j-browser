import React from 'react'
import { connect } from 'react-redux'
import { FrameTitlebar } from './FrameTitlebar'
import FrameTemplate from './FrameTemplate'
import editor from 'containers/editor'
import { HistoryRowComponent } from './HistoryRow'

import styles from './style_history.css'

const HistoryFrameComponent = ({frame, onHistoryClick}) => {
  const historyRows = frame.result.map((entry, index) => {
    return <HistoryRowComponent key={index} handleEntryClick={onHistoryClick} entry={entry}/>
  })
  return (
    <FrameTemplate
      header={<FrameTitlebar frame={frame} />}
      contents={<ul className={styles['history-list']}>{historyRows}</ul>}
    />
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
