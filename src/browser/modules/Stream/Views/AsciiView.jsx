import asciitable from 'ascii-data-table'

const AsciiView = ({rows, style}) => {
  if (!rows) {
    return (<div style={style}><em>No results found</em></div>)
  }

  return <pre style={style}>{asciitable.table(rows, 70)}</pre>
}

export default AsciiView
