import React from 'react'
import Table from 'grommet/components/Table'
import TableRow from 'grommet/components/TableRow'

import style from './code_style.css'

const CodeView = ({request, query}) => {
  return (
    <Table scrollable={false}>
      <tbody className={style.altRows}>
        <TableRow key={1}>
          <td className={style.bold}>Server version</td>
          <td>{request.result.summary.server.version}</td>
        </TableRow>
        <TableRow key={2}>
          <td className={style.bold}>Server address</td>
          <td>{request.result.summary.server.address}</td>
        </TableRow>
        <TableRow key={3}>
          <td className={style.bold}>Query</td>
          <td>{query}</td>
        </TableRow>
        <TableRow key={4}>
          <td className={style.bold}>Response</td>
          <td>
            <pre>{JSON.stringify(request.result.records, null, 2)}</pre>
          </td>
        </TableRow>
      </tbody>
    </Table>
  )
}

export default CodeView
