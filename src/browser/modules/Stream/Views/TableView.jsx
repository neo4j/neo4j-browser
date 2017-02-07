import React from 'react'
import { v4 } from 'uuid'
import Table from 'grommet/components/Table'
import TableRow from 'grommet/components/TableRow'

const TableView = ({data}) => {
  const dataCopy = data.slice()
  const headerData = dataCopy.shift()
  const tableHeader = (
    <thead>
      <tr>
        {
          headerData.map((header) => (<th className='table-header' key={v4()}>{header}</th>))
        }
      </tr>
    </thead>
  )
  const buildData = (entries) => {
    return entries.map((entry) => <td className='table-properties' key={v4()}>{JSON.stringify(entry.properties)}</td>)
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
        dataCopy.map((item) => (
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

export default TableView
