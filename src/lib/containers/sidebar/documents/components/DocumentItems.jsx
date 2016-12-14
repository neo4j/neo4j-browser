import React from 'react'
import { connect } from 'react-redux'
import uuid from 'uuid'
import {ListItem} from 'grommet/components/List'
import editor from 'containers/editor'
import {H4} from 'nbnmui/headers'
import {FavoriteItem} from 'nbnmui/buttons'

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
          <FavoriteItem delete={false} className='command' key={uuid.v4()} onClick={() => onItemClick(item.command)}
            primaryText={item.name}
          />
        )
    }
  })
  return (
    <div>
      <H4 content={header}/>
      <div className='document'>
        {listOfItems}
      </div>
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
