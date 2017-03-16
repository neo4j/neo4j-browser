import asciitable from 'ascii-data-table'

const AsciiView = ({rows}) => {
  return <pre>{asciitable.table(rows, 70)}</pre>
}

export default AsciiView
