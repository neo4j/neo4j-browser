/*
 * Copyright (c) 2002-2018 "Neo4j, Inc"
 * Network Engine for Objects in Lund AB [http://neotechnology.com]
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
const StyledTd = styled.td`padding: 5px;`
const StyledTdKey = styled(StyledTd)`font-weight: bold;`
export const SysInfoTableContainer = styled.div`
  display: flex;
  flex-flow: row wrap;
  padding: 30px;
  width: 100%;
`
export const SysInfoTable = ({ header, colspan, children }) => {
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

export const SysInfoTableEntry = ({ label, value, values, headers }) => {
  if (headers) {
    return (
      <StyledTr>
        {headers.map(value => <StyledTdKey>{value || '-'}</StyledTdKey>)}
      </StyledTr>
    )
  }
  if (values) {
    return (
      <StyledTr>
        {values.map(value => <StyledTd>{value || '-'}</StyledTd>)}
      </StyledTr>
    )
  }
  return (
    <StyledTr>
      <StyledTdKey>{label}</StyledTdKey>
      <StyledTd>{value || '-'}</StyledTd>
    </StyledTr>
  )
}
