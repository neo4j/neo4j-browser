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
import * as Sentry from '@sentry/react'
import React from 'react'
import styled from 'styled-components'

import { StyledErrorBoundaryButton } from 'browser-components/buttons/index'

const ErrorWrapper = styled.div`
  background-color: #fbf1f0;
  padding: 10px;
  text-align: center;
  color: #da4433;
`
type ErrorBoundaryProps = {
  caption?: string
  children: React.ReactNode
}

export default function ErrorBoundary(props: ErrorBoundaryProps): JSX.Element {
  return (
    <Sentry.ErrorBoundary
      fallback={({ error }) => (
        <ErrorWrapper>
          <p>
            Something went wrong: <em>"{(error || '').toString()}"</em> and the
            application can't recover.
          </p>
          <div style={{ marginTop: '5px' }}>
            <StyledErrorBoundaryButton onClick={() => window.location.reload()}>
              {props.caption || 'Reload application'}
            </StyledErrorBoundaryButton>
          </div>
        </ErrorWrapper>
      )}
    >
      {props.children}
    </Sentry.ErrorBoundary>
  )
}
