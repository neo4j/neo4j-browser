import React from 'react'
import { connect } from 'react-redux'
import { Favorite } from './Favorite'
import {List} from 'material-ui/List'

export class FavoritesComponent extends React.Component {
  render () {
    const scripts = this.props.scripts || []
    const onItemClick = this.props.onItemClick
    const ListOfFavorites = scripts.map((entry) => {
      return <Favorite key={entry.id} name={entry.name} content={entry.content} onItemClick={onItemClick} id={entry.id}/>
    })
    return (
      <div id='db-favorites'>
        <h3>Favorite</h3>
        <List>
          {ListOfFavorites}
        </List>
      </div>
    )
  }
}

const mapStateToProps = (state) => {
  return {
    scripts: state.favorites.scripts
  }
}

export const Favorites = connect(mapStateToProps, null)(FavoritesComponent)
