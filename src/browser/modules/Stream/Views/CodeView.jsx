/*
 * Copyright (c) 2002-2017 "Neo Technology,"
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

import {
  PaddedDiv,
  StyledTable,
  StyledTBody,
  StyledAlteringTr,
  StyledStrongTd,
  StyledTd
} from '../styled'

const CodeView = ({ request, query, style: displayStyle }) => {
  if (request.status !== 'success') return null
  return (
    <PaddedDiv style={displayStyle}>
      <StyledTable>
        <StyledTBody>
          <StyledAlteringTr>
            <StyledStrongTd>Server version</StyledStrongTd>
            <StyledTd>{request.result.summary.server.version}</StyledTd>
          </StyledAlteringTr>
          <StyledAlteringTr>
            <StyledStrongTd>Server address</StyledStrongTd>
            <StyledTd>{request.result.summary.server.address}</StyledTd>
          </StyledAlteringTr>
          <StyledAlteringTr>
            <StyledStrongTd>Query</StyledStrongTd>
            <StyledTd>{query}</StyledTd>
          </StyledAlteringTr>
          <StyledAlteringTr>
            <StyledStrongTd>Response</StyledStrongTd>
            <StyledTd>
              <pre>{JSON.stringify(request.result.records, null, 2)}</pre>
            </StyledTd>
          </StyledAlteringTr>
        </StyledTBody>
      </StyledTable>
    </PaddedDiv>
  )
}

export default CodeView
