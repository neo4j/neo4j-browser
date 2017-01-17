import React from 'react'
import { connect } from 'react-redux'
import FrameTitlebar from './FrameTitlebar'
import FrameTemplate from './FrameTemplate'
import editor from 'containers/editor'
import HistoryRow from './HistoryRow'

import styles from './style_history.css'

export const HistoryFrame = ({frame, onHistoryClick}) => {
  const historyRows = frame.result.map((entry, index) => {
    return <HistoryRowComponent key={index} handleEntryClick={onHistoryClick} entry={entry} />
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

export default connect(null, mapDispatchToProps)(HistoryFrame)
