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
import { QuestionIcon, PlayIcon } from 'browser-components/icons/Icons'

export const StyledSetting = styled.div`
  padding-bottom: 15px;
`

export const StyledSettingLabel = styled.div`
  word-wrap: break-wrap;
  display: inline-block;
`

export const StyledSettingTextInput = styled.input`
  height: 34px;
  color: #555;
  font-size: 14px;
  padding: 6px 12px;
  background-color: #fff;
  border: 1px solid #ccc;
  border-radius: 4px;
  width: 192px;
`

export const StyledHelpLink = styled.a``
export const StyledHelpItem = styled.li`
  list-style-type: none;
  margin: 8px 0 0 0;
`

const StyledDocumentText = styled.a`
  cursor: pointer;
  text-decoration: none;
  &:hover {
    color: #5dade2;
    text-decoration: none;
  }
`

export const StyledDocumentActionLink = props => {
  const { name, ...rest } = props
  return (
    <StyledHelpItem onClick={props.onClick}>
      <StyledDocumentText {...rest}>
        {props.type === 'play' ? <PlayIcon /> : <QuestionIcon />}
        &nbsp;
        {name}
      </StyledDocumentText>
    </StyledHelpItem>
  )
}
