import React from 'react'
import uuid from 'uuid'

export const DocumentItems = ({header, items}) => {
  const listOfItems = items.map((item) => {
    switch (item.type) {
      case 'link':
        return (
          <li className='link' key={uuid.v4()}>
            <a href={item.command} target='_blank'>{item.name}</a>
          </li>
        )
      default :
        return (
          <li className='command' key={uuid.v4()} onClick={() => { return item.command }}>
            {item.name}
          </li>
        )
    }
  })
  return (
    <div>
      <h5>
        {header}
      </h5>
      <ul className='document'>
        {listOfItems}
      </ul>
    </div>
  )
}
