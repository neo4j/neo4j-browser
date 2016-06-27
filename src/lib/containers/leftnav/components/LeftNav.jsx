import React from 'react'
import { connect } from 'react-redux'

import LeftNavOnline from './LeftNavOnline'
import LeftNavOffline from './LeftNavOffline'
import { getActiveLeftNav } from '../reducer'
import { setActive } from '../actions'
import bookmarks from '../../bookmarks'

export const LeftNav = (props) => {
  if (props.context === 'offline') {
    return <LeftNavOffline {...props} />
  }
  return <LeftNavOnline {...props} />
}

const mapStateToProps = (state) => {
  const context = bookmarks.selectors.getActiveBookmark(state)
  return {
    activeNav: getActiveLeftNav(state, context) || 'query',
    context
  }
}

const mapDispatchToProps = (dispatch) => {
  return {
    handleNavClick: (id, context) => {
      dispatch(setActive(id, context))
    }
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(LeftNav)
