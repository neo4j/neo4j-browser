import { withBus } from 'react-suber'
import * as editor from 'shared/modules/editor/editorDuck'
import FrameTemplate from './FrameTemplate'
import HistoryRow from './HistoryRow'

import styles from './style_history.css'

export const HistoryFrame = (props) => {
  const {frame, bus} = props
  const onHistoryClick = (cmd) => {
    bus.send(editor.SET_CONTENT, editor.setContent(cmd))
  }
  const historyRows = frame.result.map((entry, index) => {
    return <HistoryRow key={index} handleEntryClick={onHistoryClick} entry={entry} />
  })
  return (
    <FrameTemplate
      header={frame}
      contents={<ul className={styles['history-list']}>{historyRows}</ul>}
    />
  )
}

export default withBus(HistoryFrame)
