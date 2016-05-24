import React from 'react'
import classNames from 'classnames'

class Navigation extends React.Component {
  render () {
    const openDrawer = this.props.openDrawer
    const onNavClick = this.props.onNavClick
    const navItemsList = this.props.navItems
    const getContentToShow = (openDrawer) => {
      if (openDrawer) {
        let filteredList = navItemsList.filter((item) => {
          return item.name.toLowerCase() === openDrawer
        })
        let TabContent = filteredList[0].content
        return <TabContent/>
      }
      return null
    }
    const navItems = navItemsList.map((item, index) => {
      const itemClass = classNames({
        open: item.name.toLowerCase() === openDrawer
      })
      return <li
        onClick={() => onNavClick(item.name.toLowerCase())}
        key={index}
        className={itemClass}
        >{item.name}</li>
    })
    const tabClass = classNames({
      hidden: !openDrawer,
      tab: true
    })
    return (
      <div id={this.props.styleId}>
        <div className='nav'>
          <ul>{navItems}</ul>
        </div>
        <div className={tabClass}>
          {getContentToShow(openDrawer)}
        </div>
      </div>
    )
  }
}

export default Navigation
