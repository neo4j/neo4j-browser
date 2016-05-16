import React from 'react'

const DatabaseInfo = ({ labels = [] }) => {
  const labelItems = () => {
    if (labels.length > 0) {
      let items = [...labels]
      items.unshift('*')
      return items.map((labelText, index) => {
        return <p className='token-label' key={index}>{labelText}</p>
      })
    }
    return <p>There are no labels to show</p>
  }
  return (
    <div id='db-drawer'>
      <h4> Database Information</h4>
      <h5> Node Labels </h5>
      {labelItems()}
    </div>
  )
}
export default DatabaseInfo
