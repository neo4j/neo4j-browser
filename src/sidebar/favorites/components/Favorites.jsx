import React from 'react'
import { connect } from 'react-redux'
import uuid from 'uuid'
import { Favorite } from './Favorite'

const FavoritesComponent = ({ favorites = { scripts: [ { name: '', content: '' } ] }, onItemClick }) => {
  const ListOfFavorites = favorites.scripts.map((entry) => {
    return <Favorite key={uuid.v1()} name={entry.name} content={entry.content} onItemClick={onItemClick}/>
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
    favorites: state.favorites
  }
}

const Favorites = connect(mapStateToProps, null)(FavoritesComponent)
export {
  FavoritesComponent,
  Favorites
}
