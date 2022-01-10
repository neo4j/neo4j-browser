import styled from 'styled-components'

export const NoBulletsUl = styled.div`
  list-style-type: none;
`

export const MarginTopLi = styled.li`
  margin-top: 15px;
`

export const MarginBottomLi = styled.li`
  margin-bottom: 15px;
`

export const MarginTop = styled.div<{ pixels?: number }>`
  margin-top: ${props => (props.pixels === undefined ? 5 : props.pixels)}px;
`

export const LinkContainer = styled.div`
  margin-top: 15px;
  display: flex;
  justify-content: flex-end;
  width: 100%;
`

export const Clickable = styled.span`
  cursor: pointer;
  color: ${props => props.theme.error};

  visibility: hidden;
  font-size: 14px;
  margin-left: 20px;
`

export const GuideListEntry = styled.li`
  margin-bottom: 15px;
  :hover ${Clickable} {
    visibility: visible;
  }
`
