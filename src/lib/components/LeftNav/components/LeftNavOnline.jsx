import React from 'react'
import { connect } from 'react-redux'
import classNames from 'classnames'

import LeftNav from './LeftNav'
import { getActiveLeftNav } from '../reducer'
import * as navItems from '../../NavItems'
import { setActive } from '../actions'
import bookmarks from '../../Bookmarks'

export const LeftNavOnline = ({activeNav, context, className, activeClassName, separatorClassName, handleNavClick}) => {
  const items = [
    {component: navItems.Query, key: 'query', className: classNames({[activeClassName]: (activeNav === 'query')})},
    {component: navItems.Separator, key: 'separator1', className: classNames({[activeClassName]: (activeNav === 'separator1'), [separatorClassName]: true})},
    {component: navItems.DatabaseInfo, key: 'dbinfo1', className: classNames({[activeClassName]: (activeNav === 'dbinfo1')})},
    {component: navItems.DatabaseInfo, key: 'dbinfo2', className: classNames({[activeClassName]: (activeNav === 'dbinfo2')})},
    {component: navItems.DatabaseInfo, key: 'dbinfo3', className: classNames({[activeClassName]: (activeNav === 'dbinfo3')})},
    {component: navItems.Separator, key: 'separator2', className: classNames({[activeClassName]: (activeNav === 'separator2'), [separatorClassName]: true})},
    {component: navItems.Favorites, key: 'favs', className: classNames({[activeClassName]: (activeNav === 'favs')})},
    {component: navItems.Styling, key: 'styling', className: classNames({[activeClassName]: (activeNav === 'styling')})},
    {component: navItems.Settings, key: 'settings', className: classNames({[activeClassName]: (activeNav === 'settings')})}
  ]
  return LeftNav(items.map((i) => <i.component {...i} onClick={() => handleNavClick(i.key, context)} />), className)
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

export default connect(mapStateToProps, mapDispatchToProps)(LeftNavOnline)
