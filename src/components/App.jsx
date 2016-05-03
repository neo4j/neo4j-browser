import React from 'react'
import Sidebar from './Sidebar'
import Main from './Main'

import { connect } from 'react-redux'

import { toggleDrawer } from '../action_creators'

const mapStateToProps = (state) => {
  return {
    frames: state.frames,
    drawer: state.drawer
  }
}

const mapDispatchToProps = (dispatch) => {
  return {
    onNavClick: (id) => {
      dispatch(toggleDrawer(id))
    }
  }
}

const AppComponent = ({drawer, children, onNavClick}) => {
  return (
    <div id='wrapper'>
      <Sidebar onNavClick={onNavClick} openDrawer={drawer} />
      <Main />
    </div>
  )
}

const App = connect(mapStateToProps, mapDispatchToProps)(AppComponent)

export default App
