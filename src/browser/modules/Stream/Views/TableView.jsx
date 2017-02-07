import React from 'react'
import { v4 } from 'uuid'
import Table from 'grommet/components/Table'
import TableRow from 'grommet/components/TableRow'
import TableHeader from 'grommet/components/TableHeader'

class TableView extends React.Component {
  constructor (props) {
    super(props)
    const dataCopy = props.data.slice()
    const headerData = dataCopy.shift()
    this.state = {
      columns: headerData,
      data: dataCopy
    }
  }
  render () {
    const onSortFunc = (index, ascending) => {
    }
    const tableHeader = (
      <TableHeader
        className='.table-header'
        labels={this.state.columns}
        sortIndex={0}
        sortAscending={false}
        onSort={onSortFunc.bind(this)}
      />
    )
    const buildData = (entries) => {
      return entries.map((entry) => {
        if (entry) {
          if (entry.properties) {
            return <td className='table-properties' key={v4()}>{JSON.stringify(entry.properties)}</td>
          }
          return <td className='table-properties' key={v4()}>{JSON.stringify(entry)}</td>
        }
        return <td className='table-properties' key={v4()}>(empty)</td>
      })
    }
    const buildRow = (item) => {
      return (
        <TableRow className='table-row' key={v4()}>
          {buildData(item)}
        </TableRow>
      )
    }
    const tableBody = (
      <tbody>
        {
          this.state.data.map((item) => (
            buildRow(item)
          ))
        }
      </tbody>
    )
    return (
      <Table>
        {tableHeader}
        {tableBody}
      </Table>
    )
  }
}

export default TableView
