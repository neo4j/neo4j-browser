import React from 'react'

const HistoryRowComponent = ({entry, handleEntryClick}) => {
  return <li onClick={() => handleEntryClick(entry.cmd)}>{entry.cmd}</li>
}

export { HistoryRowComponent }
