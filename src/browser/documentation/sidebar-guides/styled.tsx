import styled from 'styled-components'

export const NoBulletsUl = styled.div`
  list-style-type: none;
`

export const MarginTopLi = styled.li`
  margin-top: 15px;
`

export const MarginTop = styled.div`
  margin-top: 5px;
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
  position: absolute;
  right: 4px;
`

export const GuideListEntry = styled.li`
  position: relative;
  :hover ${Clickable} {
    visibility: visible;
  }
`
