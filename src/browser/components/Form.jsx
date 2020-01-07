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

import React, { Component } from 'react'
import styled from 'styled-components'

export const StyledSelect = styled.select`
  background-color: #fff;
  border: ${props => props.theme.formButtonBorder};
  border-radius: 4px;
  color: ${props => props.theme.inputText};
  display: block;
  height: 34px;
  font-size: 14px;
  padding: 6px 12px;
  min-width: 120px;
  width: 100%;
`
export const StyledInput = styled.input`
  background-color: #fff;
  border: ${props => props.theme.formButtonBorder};
  border-radius: 4px;
  color: ${props => props.theme.inputText};
  display: block;
  height: 34px;
  font-size: 14px;
  padding: 6px 12px;
  width: 100%;

  &[type='checkbox'] {
    display: inline-block;
    margin-right: 5px;
    vertical-align: middle;
    width: auto;
  }
`

export const StyledForm = styled.form`
  width: 100%;
`

export const StyledFormElement = styled.div`
  margin: 0 0 10px 0;
`

export const StyledFormElementWrapper = styled.div`
  display: flex;
  > div {
    flex-grow: 1;
    &:not(:last-child) {
      margin-right: 10px;
    }
  }
`

const StyledSettingTextInput = styled(StyledInput)`
  height: 34px;
  color: #555;
  font-size: 14px;
  padding: 6px 12px;
  background-color: #fff;
  border: 1px solid #ccc;
  border-radius: 4px;
  width: 192px;
`

const StyledCheckbox = styled.input`
  margin-right: 10px;
`
const StyledRadio = styled.input`
  margin-right: 10px;
`
export const StyledLabel = styled.label`
  /* margin-left: 10px; */
  display: inline-block;
  font-weight: 600;
  vertical-align: middle;

  input[type='radio'] + & {
    font-weight: 400;
  }

  &:first-letter {
    text-transform: uppercase;
  }
`
const StyledRadioEntry = styled.div`
  margin: 10px 0;
`

export const TextInput = props => {
  const { children, ...rest } = props
  return <StyledSettingTextInput {...rest}>{children}</StyledSettingTextInput>
}

export const CheckboxSelector = props => {
  return props.checked ? (
    <StyledCheckbox type="checkbox" {...props} />
  ) : (
    <StyledCheckbox type="checkbox" {...props} />
  )
}

export class RadioSelector extends Component {
  state = {}
  constructor(props) {
    super(props)
    this.state.selectedValue = this.props.selectedValue || null
  }

  isSelectedValue(option) {
    return option === this.state.selectedValue
  }

  render() {
    return (
      <form>
        {this.props.options.map(option => {
          return (
            <StyledRadioEntry key={option}>
              <StyledRadio
                type="radio"
                value={option}
                checked={this.isSelectedValue(option)}
                onChange={event => {
                  this.setState({ selectedValue: option })
                  this.props.onChange(event)
                }}
              />
              <StyledLabel>{option}</StyledLabel>
            </StyledRadioEntry>
          )
        })}
      </form>
    )
  }
}
