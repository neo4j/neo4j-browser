import styled, { keyframes } from 'styled-components'

const pushRight = keyframes`
  from {
    transform: translate(0, 0);
    width: 0px;
  }
  to {
    opacity: 1;
  }
`

export const StyledSidebar = styled.div`
  flex: 0;
  background-color: #4C4957;
  display: flex;
  flex-direction: row;
  border-right: 1px solid black;
  color: #fff;
`

export const StyledDrawer = styled.div`
  flex: 0 0 300px;
  width: 300px;
  background-color: #30333A;
  overflow: auto;
  animation: ${pushRight} .2s linear;
`

export const HiddenDrawer = styled.div`
 display: none;
`

export const StyledTabsWrapper = styled.div`
  display: flex;
  flex-direction: column;
`

const StyledTabList = styled.ul`
  margin: 0;
  padding: 0;
`

export const StyledTopNav = styled(StyledTabList)`
  align-self: flex-start;
  & > li {
    border-bottom: 1px solid #5d6370;
  }
`
export const StyledBottomNav = styled(StyledTabList)`
  align-self: flex-end;
  margin-top: auto;
  & > li {
    border-top: 1px solid #5d6370;
  }
`
