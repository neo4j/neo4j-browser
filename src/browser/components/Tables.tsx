/*
 * Copyright (c) "Neo4j"
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

import { toKeyString } from 'neo4j-arc/common'

const StyledTable = styled.table`
  border-radius: 4px;
  margin: 0 15px 20px 15px;
  -webkit-box-shadow: 0 1px 1px rgba(0, 0, 0, 0.05);
  box-shadow: 0 1px 1px rgba(0, 0, 0, 0.05);
`
const StyledTr = styled.tr`
  padding: 10px 15px;
  border: 1px solid #ddd;
  background-color: ${props => props.theme.secondaryBackground};
  color: ${props => props.theme.secondaryText};
`
const StyledTh = styled.th`
  font-size: 18px;
  -webkit-column-span: all;
  column-span: all;
  text-align: left;
  background-color: ${props => props.theme.secondaryBackground};
  border-color: #ddd;
  padding: 10px 15px;
`
const StyledTd = styled.td`
  padding: 5px;
`
const StyledTdKey = styled(StyledTd)`
  font-weight: bold;
`
export const SysInfoTableContainer = styled.div`
  display: flex;
  flex-flow: row wrap;
  padding: 30px;
  width: 100%;
`
export const StyledSysInfoTable = ({ header, colspan, children }: any) => {
  return (
    <StyledTable>
      <thead>
        <StyledTr>
          <StyledTh colSpan={colspan || 2}>{header}</StyledTh>
        </StyledTr>
      </thead>
      <tbody>{children}</tbody>
    </StyledTable>
  )
}

export const SysInfoTableEntry = ({
  label,
  value,
  values,
  headers,
  mapper,
  optional
}: any) => {
  const missingValuePlaceholder = '-'
  const getValue = (v: any, m: any) => (m && v ? mapper(v) : v)
  if (headers) {
    return (
      <StyledTr key="headers-row">
        {headers.map((value: any) => {
          const mappedValue = getValue(value, mapper)
          const val = mappedValue || missingValuePlaceholder
          return mappedValue || !optional ? (
            <StyledTdKey key={toKeyString(val)}>{val}</StyledTdKey>
          ) : null
        })}
      </StyledTr>
    )
  }
  if (values) {
    return (
      <StyledTr key="values-row">
        {values.map((value: any, rowIndex: any) => {
          const mappedValue = getValue(value, mapper)
          const val = mappedValue || missingValuePlaceholder
          return mappedValue || !optional ? (
            <StyledTd key={toKeyString(`${val}${rowIndex}`)}>{val}</StyledTd>
          ) : null
        })}
      </StyledTr>
    )
  }
  const mappedValue = getValue(value, mapper)

  return mappedValue || !optional ? (
    <StyledTr>
      <StyledTdKey>{label}</StyledTdKey>
      <StyledTd data-testid={label}>
        {mappedValue || missingValuePlaceholder}
      </StyledTd>
    </StyledTr>
  ) : null
}
