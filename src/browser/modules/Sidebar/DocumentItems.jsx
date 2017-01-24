import React from 'react'
import { connect } from 'react-redux'
import uuid from 'uuid'
import ListItem from 'grommet/components/ListItem'
import List from 'grommet/components/List'
import * as editor from '../../../shared/modules/history/historyDuck'
import { H4 } from 'nbnmui/headers'
import { FavoriteItem } from 'nbnmui/buttons'

export const DocumentItems = ({header, items, onItemClick = null}) => {
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
          <FavoriteItem className='command' key={uuid.v4()} onClick={() => onItemClick(item.command)}
            primaryText={item.name}
          />
        )
    }
  })
  return (
    <div>
      <H4>{header}</H4>
      <List className='document'>
        {listOfItems}
      </List>
    </div>
  )
}

const mapDispatchToProps = (dispatch) => {
  return {
    onItemClick: (cmd) => {
      dispatch(editor.setContent(cmd))
    }
  }
}

export default connect(null, mapDispatchToProps)(DocumentItems)
