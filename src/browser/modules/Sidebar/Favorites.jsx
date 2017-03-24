import { connect } from 'preact-redux'
import { withBus } from 'preact-suber'
import * as editor from 'shared/modules/editor/editorDuck'
import * as favorite from 'shared/modules/favorites/favoritesDuck'
import Favorite from './Favorite'
import FileDrop from './FileDrop'
import {Drawer, DrawerBody, DrawerHeader, DrawerSection, DrawerSubHeader} from 'browser-components/drawer'

export const Favorites = (props) => {
  const ListOfFavorites = props.favorites.map((entry) => {
    return <Favorite key={entry.id} id={entry.id} name={entry.name} content={entry.content} onItemClick={props.onItemClick} removeClick={props.removeClick} />
  })

  return (
    <Drawer id='db-favorites'>
      <DrawerHeader>Favorites</DrawerHeader>
      <DrawerBody>
        <DrawerSection>
          {ListOfFavorites}
        </DrawerSection>
        <DrawerSection>
          <DrawerSubHeader>Import</DrawerSubHeader>
          <FileDrop />
        </DrawerSection>
      </DrawerBody>
    </Drawer>
  )
}

const mapStateToProps = (state) => {
  return {
    favorites: state.documents || []
  }
}
const mapDispatchToProps = (dispatch, ownProps) => {
  return {
    onItemClick: (cmd) => {
      ownProps.bus.send(editor.SET_CONTENT, editor.setContent(cmd))
    },
    removeClick: (id) => {
      const action = favorite.removeFavorite(id)
      ownProps.bus.send(action.type, action)
    }
  }
}

export default withBus(connect(mapStateToProps, mapDispatchToProps)(Favorites))
