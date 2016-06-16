import React from 'react'
import sidebar from '../../sidebar'
import main from '../../main'
import { connect } from 'react-redux'
const mapStateToProps = (state) => {
  return {
    drawer: state.drawer
  }
}

const mapDispatchToProps = (dispatch) => {
  return {
    onNavClick: (id) => {
      dispatch(sidebar.actions.toggle(id))
    }
  }
}

export const AppComponent = ({drawer, children, onNavClick}) => {
  return (
    <div id='wrapper'>
      <sidebar.components.Sidebar onNavClick={onNavClick} openDrawer={drawer} />
      <main.components.Main />
    </div>
  )
}
export const App = connect(mapStateToProps, mapDispatchToProps)(AppComponent)
