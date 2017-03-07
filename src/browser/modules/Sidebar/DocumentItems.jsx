import { connect } from 'react-redux'
import uuid from 'uuid'
import { withBus } from 'react-suber'
import { SET_CONTENT, setContent } from 'shared/modules/editor/editorDuck'
import { H4 } from 'nbnmui/headers'
import { FavoriteItem } from 'nbnmui/buttons'

export const DocumentItems = ({header, items, onItemClick = null}) => {
  const listOfItems = items.map((item) => {
    switch (item.type) {
      case 'link':
        return (
          <li className='link' key={uuid.v4()}>
            <a href={item.command} target='_blank'>{item.name}</a>
          </li>
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
      <ul className='document'>
        {listOfItems}
      </ul>
    </div>
  )
}

const mapDispatchToProps = (dispatch, ownProps = {}) => {
  return {
    onItemClick: (cmd) => {
      ownProps.bus.send(SET_CONTENT, setContent(cmd))
    }
  }
}

export default withBus(connect(null, mapDispatchToProps)(DocumentItems))
