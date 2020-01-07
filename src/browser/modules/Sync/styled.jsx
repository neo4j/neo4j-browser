/*
 * Copyright (c) 2002-2020 "Neo4j,"
 * Neo4j Sweden AB [http://neo4j.com]
 *
 * This file is part of Neo4j.
 *
 * Neo4j is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */
import React from 'react'
import styled from 'styled-components'

export const ConsentCheckBox = props => {
  return (
    <StyledP>
      <CheckBoxLabel htmlFor="syncConsentCheckbox">
        <StyledCheckBox
          {...props}
          type="checkbox"
          id="syncConsentCheckbox"
          value="first_checkbox"
        />
        &nbsp; By checking this box you are agreeing to the &nbsp;
        <StyledSimpleLink
          href="http://neo4j.com/terms/neo4j-browser-sync/"
          target="blank"
        >
          Neo4j Browser Sync Terms of Use
        </StyledSimpleLink>
        &nbsp; and our &nbsp;
        <StyledSimpleLink
          href="http://neo4j.com/privacy-policy/"
          target="blank"
        >
          Privacy Policy
        </StyledSimpleLink>
        .
      </CheckBoxLabel>
    </StyledP>
  )
}

export const AlertBox = props => {
  return (
    <AlertDiv>
      <CloseButton {...props}>×</CloseButton>
      <span>
        Before you can sign in, please check the box above to agree to the terms
        of use and privacy policy.
      </span>
    </AlertDiv>
  )
}

export const ClearLocalConfirmationBox = props => {
  return (
    <div>
      <AlertP>
        <strong>WARNING</strong>: This WILL erase your data stored in this web
        browsers local storage
      </AlertP>
      <AlertP>
        What do you want to do?
        <br />
        <SmallText>
          (nothing,{' '}
          <StyledSimpleLink onClick={props.onClick}>cancel</StyledSimpleLink>)
        </SmallText>
      </AlertP>
    </div>
  )
}

const StyledP = styled.p``
const StyledCheckBox = styled.input``

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
  float: right;
  vertical-align: top;
  background: transparent;
  border: 0px;
  font-size: 21px;
  outline: 0;
  line-height: 1;
`

export const SmallText = styled.span`
  font-size: 85%;
`

export const SmallHeaderText = styled.span`
  font-size: 11px;
`

const AlertP = styled.p`
  margin: 10px;
`

export const StyledSimpleLink = styled.a`
  cursor: pointer;
  text-decoration: none;
  &:hover {
    color: #5dade2;
    text-decoration: none;
  }
`
