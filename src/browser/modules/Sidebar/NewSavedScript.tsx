/*
 * Copyright (c) 2002-2020 "Neo4j,"
 * Neo4j Sweden AB [http://neo4j.com]
 * This file is part of Neo4j.
 * Neo4j is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 *
 */

import React, { useState } from 'react'
import styled from 'styled-components'

// @todo: Styled elements temporary until next set of work goes in
const StyledHeaderText = styled.div`
  font-family: 'Open Sans';
  color: white;
`

const StyledInputField = styled.input`
  height: 25px;
  width: 140px;
`

const StyledSubmitButton = styled.button`
  color: #fff;
  background-color: #428bca;
  border: none;
  border-radius: 3px;
  padding: 3px;
  font-weight: 500;
  font-size: 14px;
  height: 25px;
  margin: 5px 0 0 5px;
`

const StyledCancelButton = styled.button`
  color: #fff;
  background-color: #e74c3c;
  border: none;
  border-radius: 3px;
  padding: 3px;
  font-weight: 500;
  font-size: 14px;
  height: 25px;
  margin: 5px 0 0 5px;
`

const StyledSaveArea = styled.form`
  color: black;
  padding-left: 25px;
  margin-bottom: 20px;
`

interface NewSavedScriptProps {
  onSubmit: (name: string) => void
  onCancel: () => void
  defaultName: string
  headerText: string
}

function NewSavedScript({
  onSubmit,
  defaultName,
  headerText,
  onCancel
}: NewSavedScriptProps): JSX.Element {
  const [name, setName] = useState(defaultName)

  function formSubmit(e: React.FormEvent) {
    e.preventDefault()
    onSubmit(name)
  }
  function onChange(e: React.ChangeEvent<HTMLInputElement>) {
    e.preventDefault()
    setName(e.target.value)
  }

  return (
    <StyledSaveArea onSubmit={formSubmit}>
      <StyledHeaderText> {headerText} </StyledHeaderText>
      <StyledInputField value={name} onChange={onChange} />
      <StyledSubmitButton data-testid="saveScript" type="submit">
        Save
      </StyledSubmitButton>
      <StyledCancelButton onClick={onCancel}>Cancel</StyledCancelButton>
    </StyledSaveArea>
  )
}

export default NewSavedScript
