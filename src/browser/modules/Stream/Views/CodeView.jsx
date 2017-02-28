import React from 'react'
import style from './code_style.css'

const CodeView = ({request, query}) => {
  return (
    <table>
      <tbody className={style.altRows}>
        <tr>
          <td className={style.bold}>Server version</td>
          <td>{request.result.summary.server.version}</td>
        </tr>
        <tr>
          <td className={style.bold}>Server address</td>
          <td>{request.result.summary.server.address}</td>
        </tr>
        <tr>
          <td className={style.bold}>Query</td>
          <td>{query}</td>
        </tr>
        <tr>
          <td className={style.bold}>Response</td>
          <td>
            <pre>{JSON.stringify(request.result.records, null, 2)}</pre>
          </td>
        </tr>
      </tbody>
    </table>
  )
}

export default CodeView
