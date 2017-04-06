import styled from 'styled-components'
import { QuestionIcon, PlayIcon } from 'browser-components/icons/Icons'

export const StyledSetting = styled.div`
  padding-bottom: 15px;
`

export const StyledSettingLabel = styled.div`
  word-wrap: break-wrap;
  display: inline-block;
`

export const StyledSettingTextInput = styled.input`
  height: 34px;
  color: #555;
  font-size: 14px;
  padding: 6px 12px;
  background-color: #fff;
  border: 1px solid #ccc;
  border-radius: 4px;
  width: 192px;
`

export const StyledHelpLink = styled.a`
`
export const StyledHelpItem = styled.li`
  list-style-type: none;
  margin: 8px 0 0 0;
`

const StyledDocumentText = styled.a`
  cursor: pointer;
  text-decoration: none;
  &:hover {
    color: #5dade2;
    text-decoration: none;
  }
`

export const StyledDocumentActionLink = (props) => {
  const {name, ...rest} = props
  return (
    <StyledHelpItem onClick={props.onClick}>
      <StyledDocumentText {...rest}>{props.type === 'play' ? <PlayIcon /> : <QuestionIcon />}&nbsp;{name}</StyledDocumentText>
    </StyledHelpItem>
  )
}
