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
import { fireEvent, render } from '@testing-library/react'
import React from 'react'

import { CypherEditor } from './CypherEditor'

const noOp = () => undefined

describe('Monaco', () => {
  it('renders a component that functions as a textbox', () => {
    const { getByRole, queryByDisplayValue } = render(
      <CypherEditor
        enableMultiStatementMode={true}
        fontLigatures={true}
        useDb={null}
        history={[]}
        onChange={noOp}
        onExecute={noOp}
        isFullscreen={false}
        toggleFullscreen={noOp}
        id="id"
        sendCypherQuery={(() => {}) as any}
      />
    )

    const value = 'hello world'
    fireEvent.input(getByRole('textbox'), { target: { value } })

    expect(queryByDisplayValue(value)).toBeDefined()
  })
})
