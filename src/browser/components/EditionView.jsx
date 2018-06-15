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
import React from 'react'
import styled from 'styled-components'
import { H3 } from 'browser-components/headers'

const Aside = styled.div`
  display: table-cell;
  padding: 0 15px;
  width: 25%;
  font-family: ${props => props.theme.primaryFontFamily};
  font-size: 16px;
  font-weight: 300;
  color: ${props => props.theme.asideText};
`
const PaddedDiv = styled.div`padding: 30px 45px;`
const StyledConnectionBody = styled.div`
  font-size: 1.3em;
  line-height: 1.6em;
  padding-left: 50px;
`
const BodyContainer = styled.div`display: table-cell;`
const Code = styled.code`
  white-space: nowrap;
  overflow: hidden;
  color: #c7254e;
  background-color: #f9f2f4;
  border-radius: 4px;
`
const P = styled.p`margin: 20px 0;`

export const EnterpriseOnlyFrame = props => {
  const { command, ...rest } = props
  return (
    <PaddedDiv {...rest}>
      <Aside>
        <H3>Frame unavailable</H3>
        What edition are you running?
      </Aside>
      <BodyContainer>
        <StyledConnectionBody>
          <P>
            Unable to display <Code>{command}</Code> because the procedures
            required to run this frame are missing. These procedures are usually
            found in Neo4j Enterprise edition.
          </P>
          <P>
            Find out more over at{' '}
            <a href='https://neo4j.com/editions/' target='_blank'>
              neo4j.com/editions
            </a>
          </P>
        </StyledConnectionBody>
      </BodyContainer>
    </PaddedDiv>
  )
}
