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
import { PlainPlayIcon } from 'browser-components/icons/Icons'

const chip = styled.div`
  word-break: break-all;
  cursor: pointer;
  font-family: ${props => props.theme.primaryFontFamily};
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
  &:hover {
    background-color: #fff;
  }
`
export const StyledRelationship = styled(chip)`
  border-radius: 3px;
  &:hover,
  &:focus,
  &:visited {
    background-color: #fff;
  }
`
export const StyledProperty = styled(chip)`
  border-radius: 2px;
  background-color: transparent;
  border: 1px solid #595d66;
  color: #9195a0;
  span {
    color: #ccc;
  }
  &:hover {
    color: #fff;
    border-color: #fff;
  }
`
export const StyledTable = styled.table``
export const StyledKey = styled.td`
  text-align: right;
  padding-right: 13px;
  width: 100px;
  color: #bcc0c9;
  font-family: ${props => props.theme.primaryFontFamily};
  outline-color: rgb(188, 192, 201);
  text-shadow: rgba(0, 0, 0, 0.4) 0 1px 0;
`
export const StyledValue = styled.td`
  font-family: ${props => props.theme.primaryFontFamily};
`

export const StyledValueUCFirst = styled(StyledValue)`
  &:first-letter {
    text-transform: uppercase;
  }
`

export const StyledLink = styled.a`
  cursor: pointer;
  color: #fff;
  &:hover {
    color: #bcc0c9;
    text-decoration: none;
  }
`
export const Link = props => {
  const { children, ...rest } = props
  return (
    <StyledLink {...rest}>
      <PlainPlayIcon />
      &nbsp;
      {children}
    </StyledLink>
  )
}

export const StyledShowMoreContainer = styled.div`
  margin-top: 10px;
`

export const StyledShowMoreLink = styled.span`
  cursor: pointer;
  color: ${props => props.theme.link};
`
