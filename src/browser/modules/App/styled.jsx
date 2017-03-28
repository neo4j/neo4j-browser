import styled from 'styled-components'

export const StyledWrapper = styled.div`
  display: flex;
  flex-direction: row;
  height: 100vh;
  font-family: ${props => props.theme.primaryFontFamily};
  font-size: 13px;
  -webkit-font-smoothing: antialiased;
`

export const StyledApp = styled.div`
  flex-grow: 1;
  flex-shrink: 1;
  flex-basis: 0%;
  display: flex;
  flex-direction: column;
  height: 100vh;
  width: 100vw;
`

export const StyledBody = styled.div`
  flex: auto;
  display: flex;
  flex-direction: row;
`

export const StyledMainWrapper = styled.div`
  flex: auto;
  background-color: #D2D5DA;
  overflow: auto;
  padding: 0 24px;
  z-index: 1;
`
