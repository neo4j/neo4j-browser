import { connect } from 'preact-redux'
import { withBus } from 'preact-suber'
import * as editor from 'shared/modules/editor/editorDuck'
import * as favorite from 'shared/modules/favorites/favoritesDuck'
import { getSettings } from 'shared/modules/settings/settingsDuck'

import Visible from 'browser-components/Visible'
import {Favorite, Folder} from './Favorite'
import FileDrop from './FileDrop'
import {Drawer, DrawerBody, DrawerHeader, DrawerSection, DrawerSubHeader} from 'browser-components/drawer'

const mapFavorites = (favorites, props, isChild) => {
  return favorites.map((entry) => {
    return <Favorite key={entry.id} id={entry.id} name={entry.name} content={entry.content} onItemClick={props.onItemClick} removeClick={props.removeClick} isChild={isChild} isStatic={entry.isStatic} />
  })
}

export const Favorites = (props) => {
  const ListOfFavorites = mapFavorites(props.favorites.filter(fav => !fav.isStatic && !fav.folder), props, false)
  const ListOfFolders = props.folders.filter(folder => !folder.isStatic).map((folder) => {
    const Favorites = mapFavorites(props.favorites.filter(fav => !fav.isStatic && fav.folder === folder.id), props, true)
    return <Folder folder={folder}>{Favorites}</Folder>
  })
  const ListOfSampleFolders = props.folders.filter(folder => folder.isStatic).map((folder) => {
    const Favorites = mapFavorites(props.favorites.filter(fav => fav.isStatic && fav.folder === folder.id), props, true)
    return <Folder folder={folder}>{Favorites}</Folder>
  })

  return (
    <Drawer id='db-favorites'>
      <DrawerHeader>Favorites</DrawerHeader>
      <DrawerBody>
        <DrawerSection>
          <DrawerSubHeader>Saved Scripts</DrawerSubHeader>
          {ListOfFavorites}
          {ListOfFolders}
        </DrawerSection>
        <Visible if={props.showSampleScripts}>
          <DrawerSection>
            <DrawerSubHeader>Sample Scripts</DrawerSubHeader>
            {ListOfSampleFolders}
          </DrawerSection>
        </Visible>
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
    favorites: state.documents || [],
    folders: state.folders || [],
    showSampleScripts: getSettings(state).showSampleScripts
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
