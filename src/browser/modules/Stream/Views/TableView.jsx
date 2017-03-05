import React from 'react'
import { v4 } from 'uuid'

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
    const tableHeader = this.state.columns.map((column, i) => (
      <th className='table-header' key={i}>{column}</th>)
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
        <tr className='table-row' key={v4()}>
          {buildData(item)}
        </tr>
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
      <table>
        <thead>
          <tr>
            {tableHeader}
          </tr>
        </thead>
        {tableBody}
      </table>
    )
  }
}

export default TableView
