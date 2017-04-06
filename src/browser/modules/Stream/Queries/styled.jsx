import styled from 'styled-components'

export const Code = styled.code`
  white-space: nowrap;
  overflow: hidden;
  color: #c7254e;
  background-color: #f9f2f4;
  border-radius: 4px
`
export const StyledTable = styled.table`
  margin: 20px 10px;
  width: 100%;
  table-layout: fixed;
`
export const StyledTh = styled.th`
  text-align: left;
  height: 30px;
  vertical-align: top;
  padding: 5px;
  width: {props => props.width || 'auto'};
`
export const StyledTd = styled.td`
  padding: 5px;
  width: {props => props.width || 'auto'};
  text-overflow: ellipsis;
  overflow: hidden;
`
export const StyledHeaderRow = styled.tr`
  border-top: ${props => props.theme.inFrameBorder};
  border-bottom: ${props => props.theme.inFrameBorder};
`
