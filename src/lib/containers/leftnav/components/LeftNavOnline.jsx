import React from 'react'
import classNames from 'classnames'
import LeftNavList from './LeftNavList'
import * as navItems from '../../../components/NavItems'

const LeftNavOnline = ({activeNav, context, className, activeClassName, separatorClassName, handleNavClick}) => {
  const items = [
    {component: navItems.Query, key: 'query', className: classNames({[activeClassName]: (activeNav === 'query')})},
    {component: navItems.Separator, key: 'separator1', className: classNames({[activeClassName]: (activeNav === 'separator1'), [separatorClassName]: true})},
    {component: navItems.Dashboard, key: 'dashboard', className: classNames({[activeClassName]: (activeNav === 'dashboard')})},
    {component: navItems.DatabaseInfo, key: 'dbinfo', className: classNames({[activeClassName]: (activeNav === 'dbinfo')})},
    {component: navItems.Users, key: 'users', className: classNames({[activeClassName]: (activeNav === 'users')})},
    {component: navItems.Separator, key: 'separator2', className: classNames({[activeClassName]: (activeNav === 'separator2'), [separatorClassName]: true})},
    {component: navItems.Favorites, key: 'favs', className: classNames({[activeClassName]: (activeNav === 'favs')})},
    {component: navItems.Styling, key: 'styling', className: classNames({[activeClassName]: (activeNav === 'styling')})},
    {component: navItems.Settings, key: 'settings', className: classNames({[activeClassName]: (activeNav === 'settings')})}
  ]
  return LeftNavList(items.map((i) => <i.component {...i} onClick={() => handleNavClick(i.key, context)} />), className)
}

export default LeftNavOnline
