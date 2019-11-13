/*
 * Copyright (c) 2002-2019 "Neo4j,"
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

import styled from 'styled-components'
import { StyledInput, StyledSelect } from 'browser-components/Form'
import { StyledFrameAside } from '../../Frame/styled'

export const StyledConnectionForm = styled.form`
  padding: 0 15px;

  &.isLoading {
    opacity: 0.5;
  }
`
export const StyledConnectionAside = styled(StyledFrameAside)``
export const StyledConnectionFormEntry = styled.div`
  padding-bottom: 15px;
`
export const StyledConnectionLabel = styled.label`
  display: block;
  font-size: 13px;
  font-weight: 600;
  line-height: 2;
`
export const StyledConnectionTextInput = styled(StyledInput)`
  min-width: 200px;
  width: 44%;
`

export const StyledConnectionSelect = styled(StyledSelect)`
  min-width: 200px;
  width: 44%;
`

export const StyledConnectionBodyContainer = styled.div`
  flex: 1 1 auto;
`
export const StyledConnectionBody = styled.div`
  flex: 1 1 auto;
  font-size: 1.3em;
  line-height: 2em;
  padding-left: 50px;
`
export const StyledConnectionFooter = styled.span`
  font-size: 0.95em;
  font-weight: 200;
`
export const StyledCode = styled.code`
  color: #c7254e;
  background-color: #f9f2f4;
  border-radius: 4px;
  cursor: pointer;
  border: none;
  padding: 2px 4px;

  a {
    color: #c7254e !important;
  }
`
