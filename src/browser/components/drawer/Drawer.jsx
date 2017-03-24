import styled from 'styled-components'

export const Drawer = styled.div``

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
  font-family: ${props => props.theme.drawerHeaderFontFamily};
`

export const DrawerSubHeader = styled.h5`
  color: ${props => props.theme.primaryHeaderText}
  border-bottom: 1px solid #424650;
  font-size: 13px;
  margin-bottom: 12px;
  line-height: 39px;
  position: relative;
  font-weight: bold;
  -webkit-font-smoothing: antialiased;
  text-shadow: rgba(0, 0, 0, 0.4) 0px 1px 0px;
  font-family: ${props => props.theme.drawerHeaderFontFamily};
`

export const DrawerSection = styled.div`
  margin-bottom: 12px;
`

export const DrawerSectionBody = styled.div`
  font-family: ${props => props.theme.primaryFontFamily};
  font-weight: normal;
  color: #bcc0c9;
`

export const DrawerBody = styled.div`
  padding: 0 24px;
`
