import { connect } from 'react-redux'
import { withBus } from 'preact-suber'
import * as editor from 'shared/modules/editor/editorDuck'
import * as favorite from 'shared/modules/favorites/favoritesDuck'
import Favorite from './Favorite'
import FileDrop from './FileDrop'
import {Drawer, DrawerBody, DrawerHeader} from 'browser-components/drawer'

export const Favorites = (props) => {
  const ListOfFavorites = props.scripts.map((entry) => {
    return <Favorite key={entry.id} id={entry.id} name={entry.name} content={entry.content} onItemClick={props.onItemClick} />
  })

  return (
    <Drawer id='db-favorites'>
      <DrawerHeader title='Favorites' />
      <DrawerBody>
        {ListOfFavorites}
      </DrawerBody>
      <DrawerHeader title='Import' />
      <DrawerBody>
        <FileDrop />
      </DrawerBody>

    </Drawer>
  )
}

const mapStateToProps = (state) => {
  return {
    scripts: state.favorites.scripts || []
  }
}
const mapDispatchToProps = (dispatch, ownProps = {}) => {
  return {
    onItemClick: (cmd) => {
      ownProps.bus.send(editor.SET_CONTENT, editor.setContent(cmd))
    },
    removeClick: (id) => {
      dispatch(favorite.removeFavorite(id))
    }
  }
}

export default withBus(connect(mapStateToProps, mapDispatchToProps)(Favorites))
