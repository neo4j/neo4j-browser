import styled from 'styled-components'

export const StyledConnectionForm = styled.form`
  display: table-cell;
  padding: 0 15px;
`
export const StyledConnectionAside = styled.div`
  display: table-cell;
  padding: 0 15px;
  width: 25%;
  font-family: ${props => props.theme.primaryFontFamily};
  font-size: 15px;
  font-weight: 300;
  color: ${props => props.theme.asideText};
`
export const StyledConnectionFrame = styled.div`
  padding: 30px 45px;
`
export const StyledConnectionFormEntry = styled.div`
  padding-bottom: 15px;
`
export const StyledConnectionLabel = styled.label`
  display: block;
`
export const StyledConnectionTextInput = styled.input`
  display: block;
  height: 34px;
  color: #555;
  font-size: 14px;
  padding: 6px 12px;
  background-color: #fff;
  border: 1px solid #ccc;
  border-radius: 4px;
  width: 44%;
`
