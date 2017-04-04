import styled from 'styled-components'

export const Code = styled.code`
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  color: #c7254e;
  background-color: #f9f2f4;
  border-radius: 4px
`
export const StyledTable = styled.table`
  margin: 20px 10px;
`
export const StyledTh = styled.th`
  text-align: left;
  height: 30px;
  vertical-align: top;
  padding: 5px;
`
export const StyledTd = styled.td`
  padding: 5px;
`
export const StyledHeaderRow = styled.tr`
  border-top: ${props => props.theme.inFrameBorder};
  border-bottom: ${props => props.theme.inFrameBorder};
`
