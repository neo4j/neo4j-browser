import styled from 'styled-components'

const chip = styled.div`
  cursor: pointer
  font-family: "Helvetica Neue", Helvetica, Arial, sans-serif;
  font-weight: bold;
  font-size: 12px;
  background-color: #9195a0;
  color: #30333a;
  margin: 4px;
  padding: 3px 7px 3px 7px;
  span {
    line-height: normal;
  }
`
export const StyledLabel = styled(chip)`
  border-radius: 20px;
`
export const StyledRelationship = styled(chip)`
  border-radius: 3px;
`
export const StyledProperty = styled(chip)`
  border-radius: 2px;
  background-color: transparent;
  border: 1px solid #595d66;
  color: #9195a0;
  span {
    color: #ccc;
  }
`
