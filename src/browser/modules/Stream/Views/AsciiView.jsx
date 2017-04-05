import asciitable from 'ascii-data-table'

const AsciiView = ({rows}) => {
  if (!rows) return (<em style={style}>No results found</em>)

  return <pre style={style}>{asciitable.table(rows, 70)}</pre>
}

export default AsciiView
