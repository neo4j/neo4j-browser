import React from 'react'

const HistoryRowComponent = ({entry, onHistoryClick}) => {
  return <li onClick={() => onHistoryClick(entry.cmd)}>{entry.cmd}</li>
}

export { HistoryRowComponent }
