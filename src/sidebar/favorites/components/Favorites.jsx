import React from 'react'
import { connect } from 'react-redux'
import { Favorite } from './Favorite'

const FavoritesComponent = ({scripts, onItemClick}) => {
  const ListOfFavorites = scripts.map((entry) => {
    return <Favorite key={entry.id} name={entry.name} content={entry.content} onItemClick={onItemClick} id={entry.id}/>
  })
  return (
    <div id='db-favorites'>
      <h4>Favorite</h4>
      {ListOfFavorites}
    </div>
  )
}

const mapStateToProps = (state) => {
  return {
    scripts: state.favorites.scripts
  }
}

const Favorites = connect(mapStateToProps, null)(FavoritesComponent)
export {
  FavoritesComponent,
  Favorites
}
