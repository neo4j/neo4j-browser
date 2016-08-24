import React from 'react'
import { connect } from 'react-redux'
import { Favorite } from './Favorite'
import {Drawer, DrawerBody, DrawerHeader} from 'nbnmui/drawer'

export const FavoritesComponent = ({scripts = [], onItemClick}) => {
  const ListOfFavorites = scripts.map((entry) => {
    return <Favorite key={entry.id} name={entry.name} content={entry.content} onItemClick={onItemClick} id={entry.id}/>
  })
  return (
    <Drawer id='db-favorites'>
      <DrawerHeader title='Favorite'/>
      <DrawerBody>
        {ListOfFavorites}
      </DrawerBody>
    </Drawer>
  )
}

const mapStateToProps = (state) => {
  return {
    scripts: state.favorites.scripts
  }
}

export const Favorites = connect(mapStateToProps, null)(FavoritesComponent)
