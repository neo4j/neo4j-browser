import React from 'react'
import { connect } from 'react-redux'
import uuid from 'uuid'
import {List, ListItem} from 'material-ui/List'
import editor from 'containers/editor'

export const DocumentItemsComponent = ({header, items, onItemClick = null}) => {
  const listOfItems = items.map((item) => {
    switch (item.type) {
      case 'link':
        return (
          <ListItem className='link' key={uuid.v4()}>
            <a href={item.command} target='_blank'>{item.name}</a>
          </ListItem>
        )
      default:
        return (
          <ListItem className='command' key={uuid.v4()} onClick={() => onItemClick(item.command)}>
            {item.name}
          </ListItem>
        )
    }
  })
  return (
    <div>
      <h3>{header}</h3>
      <List className='document'>
        {listOfItems}
      </List>
    </div>
  )
}

const mapDispatchToProps = (dispatch) => {
  return {
    onItemClick: (cmd) => {
      dispatch(editor.actions.setContent(cmd))
    }
  }
}

export const DocumentItems = connect(null, mapDispatchToProps)(DocumentItemsComponent)
