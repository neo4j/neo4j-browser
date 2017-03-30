import styled from 'styled-components'

const StyledTable = styled.table`
  border-radius: 4px;
  margin: 0 15px 20px 15px;
  background-color: #fff;
  -webkit-box-shadow: 0 1px 1px rgba(0,0,0,.05);
  box-shadow: 0 1px 1px rgba(0,0,0,.05);
  `
const StyledTr = styled.tr`
  padding: 10px 15px;
  border: 1px solid #ddd;
`
const StyledTh = styled.th`
  font-size: 18px;
  -webkit-column-span: all;
  column-span: all;
  text-align: left;
  background-color: #f5f5f5;
  border-color: #ddd;
  padding: 10px 15px
`
const StyledTd = styled.td`
  padding: 5px;
`
const StyledTdKey = styled(StyledTd)`
  font-weight: bold;
`
export const SysInfoTableContainer = styled.div`
  display: flex;
  flex-flow: row wrap;
  padding: 30px;
  width: 100%;
`
export const SysInfoTable = ({header, colspan, children}) => {
  return (
    <StyledTable>
      <thead>
        <StyledTr>
          <StyledTh colSpan={colspan || 2}>{header}</StyledTh>
        </StyledTr>
      </thead>
      <tbody>
        {children}
      </tbody>
    </StyledTable>
  )
}

export const SysInfoTableEntry = ({label, value, values, headers}) => {
  if (headers) {
    return (
      <StyledTr>
        {headers.map((value) => <StyledTdKey>{value}</StyledTdKey>)}
      </StyledTr>
    )
  }
  if (values) {
    return (
      <StyledTr>
        {values.map((value) => <StyledTd>{value}</StyledTd>)}
      </StyledTr>
    )
  }
  return (
    <StyledTr>
      <StyledTdKey>{label}</StyledTdKey>
      <StyledTd>{value}</StyledTd>
    </StyledTr>
  )
}
