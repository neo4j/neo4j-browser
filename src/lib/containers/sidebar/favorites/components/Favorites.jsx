import React from 'react'
import { connect } from 'react-redux'
import { Favorite } from './Favorite'
import {List} from 'material-ui/List'

export const FavoritesComponent = ({scripts = [], onItemClick}) => {
  const ListOfFavorites = scripts.map((entry) => {
    return <Favorite key={entry.id} name={entry.name} content={entry.content} onItemClick={onItemClick} id={entry.id}/>
  })
  return (
    <div id='db-favorites'>
      <h3>Favorite</h3>
      <List >
        {ListOfFavorites}
      </List>
    </div>
  )
}

const mapStateToProps = (state) => {
  return {
    scripts: state.favorites.scripts
  }
}

export const Favorites = connect(mapStateToProps, null)(FavoritesComponent)
