const HistoryRow = ({entry, handleEntryClick}) => {
  return <li onClick={() => handleEntryClick(entry.cmd)}>{entry.cmd}</li>
}
export default HistoryRow
