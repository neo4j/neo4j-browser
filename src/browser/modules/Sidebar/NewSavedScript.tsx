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

import React, { useState, useEffect } from 'react'
import styled from 'styled-components'
const StyledForm = styled.form`
  color: black;
  padding-left: 25px;
  margin-bottom: 20px;
  display: flex;
  font-size: 16px;
`

const StyledHeaderText = styled.div`
  font-family: 'Open Sans';
  color: white;
`
const StyledInputField = styled.input`
  margin-left: 8px;
  margin-bottom: -3px;
  border: none;
  border-radius: 3px 0 0 3px;
  height: 25px;
  width: 140px;
`

const StyledSubmitButton = styled.button`
  color: #fff;
  background-color: #428bca;
  border: none;
  border-radius: 0 3px 3px 0;
  padding: 3px;
  font-weight: 500;
  font-size: 14px;
  height: 25px;
`

interface NewSavedScriptProps {
  onSubmit: (name: string) => void
  defaultName: string
  headerText: string
}

function NewSavedScript({
  onSubmit,
  defaultName,
  headerText
}: NewSavedScriptProps): JSX.Element {
  const [name, setName] = useState(defaultName)
  const [shouldShow, setShouldShow] = useState(!!defaultName)
  useEffect(() => {
    setShouldShow(!!defaultName)
  }, [defaultName])

  function formSubmit(e: React.FormEvent) {
    e.preventDefault()
    onSubmit(name)
    setShouldShow(false)
  }
  function onChange(e: React.ChangeEvent<HTMLInputElement>) {
    e.preventDefault()
    setName(e.target.value)
  }

  return shouldShow ? (
    <>
      <StyledForm onSubmit={formSubmit}>
        <StyledHeaderText> {headerText} </StyledHeaderText>
        <StyledInputField value={name} onChange={onChange} />
        <StyledSubmitButton data-testid="saveScript" type="submit">
          save
        </StyledSubmitButton>
      </StyledForm>
    </>
  ) : (
    <span />
  )
}

export default NewSavedScript
