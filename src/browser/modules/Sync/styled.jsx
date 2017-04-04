import styled from 'styled-components'

export const ConsentCheckBox = (props) => {
  return (
    <StyledP>
      <CheckBoxLabel for='syncConsentCheckbox'>
        <StyledCheckBox {...props} type='checkbox' id='syncConsentCheckbox' value='first_checkbox' />
        &nbsp; By checking this box you are agreeing to the &nbsp;
        <a href='http://neo4j.com/terms/neo4j-browser-sync/' target='blank'>Neo4j Browser Sync Terms of Use</a>
        &nbsp; and our &nbsp;
        <a href='http://neo4j.com/privacy-policy/' target='blank'>Privacy Policy</a>.
      </CheckBoxLabel>
    </StyledP>
  )
}

export const AlertBox = (props) => {
  return (
    <AlertDiv>
      <CloseButton {...props}>×</CloseButton>
      <span>Before you can sign in, please check the box above to agree to the terms of use and privacy policy.</span>
    </AlertDiv>
  )
}

export const ClearLocalConfirmationBox = (props) => {
  return (
    <div>
      <AlertP><strong>WARNING</strong>: This WILL erase your data stored in this web browsers local storage</AlertP>
      <AlertP>
        What do you want to do?<br />
        <SmallText>(nothing, <SyncLink onClick={props.onClick}>cancel</SyncLink>)</SmallText>
      </AlertP>
    </div>
  )
}

const StyledP = styled.p`
  
`
const StyledCheckBox = styled.input`

`

const CheckBoxLabel = styled.label`
  display: inline-block;
`

const AlertDiv = styled.div`
  color: #8a6d3b;
  background-color: #fcf8e3;
  border-color: #faebcc;
  padding: 15px;
  display: inline-block;
`

const CloseButton = styled.button`
  float:right;
  vertical-align: top;
  background: transparent;
  border: 0px;
  font-size : 21px;
  outline: 0;
  line-height: 1
`

export const SmallText = styled.span`
  font-size: 85%;
`

export const SmallHeaderText = styled.span`
  font-size : 11px;
`

const AlertP = styled.p`
  margin: 10px
`
export const SyncLink = styled.a`
  cursor: pointer;
`
