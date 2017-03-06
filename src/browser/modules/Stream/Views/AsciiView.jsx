import asciitable from 'ascii-data-table'

const AsciiView = ({rows}) => {
  return <pre>{asciitable.table(rows)}</pre>
}

export default AsciiView
