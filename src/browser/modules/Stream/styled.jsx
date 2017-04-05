import styled, { keyframes } from 'styled-components'
import { dim } from 'browser-styles/constants'

export const StyledStream = styled.div`
  padding: 0;
  display: flex;
  flex-direction: column;
  margin-top: 17px;
`

const rollDownAnimation = keyframes`
  from {
    transform: translate(0, -${dim.frameBodyHeight * 0.3}px);
    opacity: 0;
    height: 0px;
  }
  70% {
    opacity: 0;
    height: 300px;
  }
  to {
    opacity: 1;
  }
`

// Frames
export const StyledFrame = styled.article`
  width: auto;
  background-color: #fff;
  box-shadow: 0 1px 4px rgba(0,0,0,.1);
  animation: ${rollDownAnimation} + .2s linear;
  border: ${props => props.theme.frameBorder};
  margin: ${props => props.fullscreen ? '0' : '10px 0px 10px 0px'};
  ${props => props.fullscreen ? 'position: fixed' : null};
  ${props => props.fullscreen ? 'left: 0' : null};
  ${props => props.fullscreen ? 'top: 0' : null};
  ${props => props.fullscreen ? 'bottom: 0' : null};
  ${props => props.fullscreen ? 'right: 0' : null};
  ${props => props.fullscreen ? 'z-index: 1030' : null};
`

export const StyledVisContainer = styled.div`
  width: 100%;
  display : ${props => props.style.display}
`

export const StyledFrameBody = styled.div`
  height: ${props => props.collapsed ? 0 : (props.fullscreen ? '100%' : dim.frameBodyHeight + 'px')};
  visibility: ${props => props.collapsed ? 'hidden' : 'visible'};
  display: flex;
  flex-direction: row;
  overflow: auto;
`

export const StyledFrameMainSection = styled.div`
  min-width: 0;
  flex: 1 1 auto;
`

export const StyledFrameContents = styled.div`
  overflow: auto;
  height: ${props => (props.fullscreen ? '100vh' : (dim.frameBodyHeight) + 'px')};
  padding: 0 20px 20px 20px;
  padding-top: 0;
  padding-bottom: ${props => (props.fullscreen ? (dim.frameTitlebarHeight + 20) + 'px' : '20px')};
`

export const StyledFrameSidebar = styled.ul`
  line-height: 33px;
  width: 45px;
  margin-left: -5px;
  list-style: none;
  padding-left: 0;
  margin: 0;
  flex: 0 0 auto;
  border-right: ${props => props.theme.inFrameBorder};
  background-color: ${props => props.theme.frameSidebarBackground};
`

export const StyledFrameStatusbar = styled.div`
  border-top: ${props => props.theme.inFrameBorder};
  height: ${dim.frameStatusbarHeight}px;
  margin-top: -${dim.frameStatusbarHeight}px;
`

export const StyledFrameTitleBar = styled.div`
  height: ${dim.frameTitlebarHeight}px;
  border-bottom: ${props => props.theme.inFrameBorder};
  line-height: ${dim.frameTitlebarHeight}px;
  color: ${props => props.theme.frameTitlebarText};
  display: flex;
  flex-direction: row;
`

export const FrameTitlebarButtonSection = styled.ul`
  flex: 0 0 auto;
  margin-left: -5px;
  list-style: none;
  padding-left: 0;
  margin: 0;
  margin-left: auto;
`

export const StyledFrameCommand = styled.label`
  margin: 3px 5px 3px 5px;
  flex: 1 1 auto;
  min-width: 0;
  cursor: pointer;
  white-space: nowrap;
  text-overflow: ellipsis;
  overflow: hidden;
  display: block;
`

export const StyledHelpFrame = styled.div`
  padding: 30px
`
export const StyledHelpContent = styled.div`
  padding-top: 10px
  padding-bottom: 10px
`
export const StyledHelpDescription = styled.div`
  margin-bottom: 10px
  font-size: 15px
`

export const StyledDiv = styled.div`
`

export const StyledCypherMessage = styled.div`
  font-weight: bold
  line-height: 1em
  text-align: center
  white-space: nowrap
  vertical-align: baseline
  user-select: none
  font-size: 12px
  margin-right: 5px
  padding: 4px 7px 4px 5px
  border-radius: 3px
  float: left
`
export const StyledCypherWarningMessage = styled(StyledCypherMessage)`
  background-color: #FFA500
  color: #FFFFFF
`

export const StyledCypherErrorMessage = styled(StyledCypherMessage)`
  background-color: #E74C3C
  color: #FFFFFF
`

export const StyledH4 = styled.h4`
`

export const StyledBr = styled.br`
`

export const StyledPreformattedArea = styled.pre`
  font-family: Monaco, "Courier New", Terminal, monospace
  font-size: 14px
  padding: 12px 16px
  margin: 0
  background: none
  border: none
  background-color: #f5f5f5
`

export const StyledNevadaCanvas = styled.div`
  height: 100%;
  width: 100%;
  > .nevada-canvas {
    position: relative;
    height: 100%;
    width: 100%;
  }
`
