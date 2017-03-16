// import { H4 } from 'browser-components/headers'
import styles from './style.css'
import styled from 'styled-components'
// import { dim } from 'browser-styles/constants'

export const Drawer = (props) => {
  return <div className={styles.drawer} {...props} />
}
export const DrawerHeader = styled.h4`
  color: ${props => props.theme.primaryHeaderText}
  background-color: ${props => props.theme.drawerBackground}
  font-size: 17px;
  height: 73px;
  padding: 28px 0 0 25px;
  position: relative;
  font-weight: bold;
  -webkit-font-smoothing: antialiased;
  text-shadow: rgba(0, 0, 0, 0.4) 0px 1px 0px;
  font-family: ${props => props.theme.drawerHeaderFontFamily}
`

export const DrawerBody = (props) => {
  return (
    <ul className={styles.drawerBody}>{props.children}</ul>
  )
}
