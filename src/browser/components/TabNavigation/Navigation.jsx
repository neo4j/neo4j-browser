import classNames from 'classnames'
import { NavigationButton } from 'browser-components/buttons'
import { StyledDrawer } from './styled'
const Navigation = ({
  openDrawer,
  onNavClick,
  topNavItems,
  bottomNavItems = [],
  selectedItemClassName,
  tabClassName,
  sidebarClassName,
  listClassName
}) => {
  const buildNavList = (list) => {
    return list.map((item, index) => {
      const itemClass = classNames({
        [selectedItemClassName]: item.name.toLowerCase() === openDrawer
      })
      return (
        <li key={index}
          className={itemClass}
          onClick={() => onNavClick(item.name.toLowerCase())}>
          <NavigationButton name={item.name}>{item.icon}</NavigationButton>
        </li>
      )
    })
  }
  const getContentToShow = (openDrawer) => {
    if (openDrawer) {
      let filteredList = topNavItems.concat(bottomNavItems).filter((item) => {
        return item.name.toLowerCase() === openDrawer
      })
      let TabContent = filteredList[0].content
      return <TabContent />
    }
    return null
  }
  const topNavItemsList = buildNavList(topNavItems)
  const bottomNavItemsList = buildNavList(bottomNavItems)
  const tabClass = classNames({
    hidden: !openDrawer,
    [tabClassName]: true
  })
  return (
    <div className={sidebarClassName}>
      <ul className={listClassName}>
        <ul className={listClassName}>{topNavItemsList}</ul>
        <ul className={listClassName}>{bottomNavItemsList}</ul>
      </ul>
      <StyledDrawer className={tabClass}>
        <div className='tab'>
          {getContentToShow(openDrawer)}
        </div>
      </StyledDrawer>
    </div>
  )
}

export default Navigation
