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
  margin-left: 8px;
  cursor: pointer;

  :hover {
    text-decoration: underline;
    color: ${props => props.theme.error};
  }
`
