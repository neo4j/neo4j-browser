import asciitable from 'ascii-data-table'

const AsciiView = ({rows}) => {
  if (!rows) return (<em>No results found</em>)
  return <pre>{asciitable.table(rows, 70)}</pre>
}

export default AsciiView
