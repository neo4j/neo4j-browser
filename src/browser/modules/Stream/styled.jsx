import styled, { keyframes } from 'styled-components'
import { dim } from 'browser-styles/constants'

export const StyledStream = styled.div`
  padding: 0;
  display: flex;
  flex-direction: column;
  margin-top: ${dim.editorbarHeight + 14}px;
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
  margin: 10px 0px 10px 0px;
  width: auto;
  background-color: #fff;
  box-shadow: 0 1px 4px rgba(0,0,0,.1);
  animation: ${rollDownAnimation} .2s linear;
`

export const StyledFullscreenFrame = styled(StyledFrame)`
  position: fixed;
  left: 0;
  top: 0;
  bottom: 0;
  right: 0;
  margin: 0;
  z-index: 1030;
`

export const StyledFrameBody = styled.div`
  height: ${props => props.collapsed ? 0 : (props.fullscreen ? '100%' : dim.frameBodyHeight + 'px')};
  visibility: ${props => props.collapsed ? 'hidden' : 'visible'};
  display: flex;
  flex-direction: row;
`

export const StyledFrameMainSection = styled.div`
  min-width: 0;
  flex: 1 1 auto;
`

export const StyledFrameContents = styled.div`
  overflow: auto;
  height: 100%;
  padding: 0 20px 20px 20px;
  padding-top: 0;
`

export const StyledFrameSidebar = styled.ul`
  width: 76px;
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
  flex: 0 0 205px;
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
