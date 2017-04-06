import styled from 'styled-components'
import { dim } from 'browser-styles/constants'

export const Bar = styled.div`
  display: flex;
  flex-direction: row;
  align-items: middle;
  min-height: ${dim.editorbarHeight}px;
  overflow: hidden;
  box-shadow: 0 1px 4px rgba(0,0,0,.1);
  `
export const ActionButtonSection = styled.div`
  flex: 0 0 130px;
  align-items: center;
  display: flex;
  justify-content: space-around;
  background-color: ${props => props.theme.editorBarBackground};
`

export const EditorWrapper = styled.div`
  flex: auto;
  padding: 12px 12px 12px 12px;
  background-color: ${props => props.theme.editorBarBackground};
  font-family: Monaco,"Courier New",Terminal,monospace;
`
