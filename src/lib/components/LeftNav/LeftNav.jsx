import React from 'react'
import * as navItems from '../NavItems'

const LeftNav = (items, className) => {
  return <ul className={className}>{items}</ul>
}

export const LeftNavOffline = ({className, separatorClassName}) => {

}

export const LeftNavOnline = ({className, separatorClassName}) => {
  const items = [
    <navItems.Query key='Query' />,
    <navItems.Separator key='Separator1' className={separatorClassName} />,
    <navItems.DatabaseInfo key='db1' />,
    <navItems.DatabaseInfo key='db2' />,
    <navItems.DatabaseInfo key='db3' />,
    <navItems.Separator key='Separator2' className={separatorClassName} />,
    <navItems.Favorites key='Favorites' />,
    <navItems.Styling key='Styling' />,
    <navItems.Settings key='Settings' />
  ]
  return LeftNav(items, className)
}
