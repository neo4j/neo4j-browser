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
import { render, screen } from '@testing-library/react'
import React from 'react'

import { ShowMoreOrAll } from 'neo4j-arc/common'

describe('<ShowMoreOrAll />', () => {
  type RenderShowMoreOrAllProps = {
    moreStep?: number
    shown?: number
    total?: number
  }
  const renderShowMoreOrAll = ({
    moreStep = 5,
    shown = 5,
    total = 5
  }: RenderShowMoreOrAllProps) => {
    return render(
      <ShowMoreOrAll
        moreStep={moreStep}
        onMore={jest.fn()}
        shown={shown}
        total={total}
      />
    )
  }

  test('if shown is equal to total then should not render anything', () => {
    const shown = 5
    const total = shown
    const { container } = renderShowMoreOrAll({ shown: shown, total: total })

    expect(container.innerHTML).toBe('')
  })

  describe('if shown is smaller than total then should render show more/all', () => {
    test('if elements left to total are larger than step size, should get step size on Show more', () => {
      const shown = 5
      const stepSize = 10
      const total = shown + stepSize + 1
      renderShowMoreOrAll({ moreStep: stepSize, shown: shown, total: total })

      expect(screen.getByText(`Show ${stepSize} more`)).toBeInTheDocument()
      expect(screen.getByText(`Show all`)).toBeInTheDocument()
    })

    test('if elements left to total are larger than step size, should get step size on Show more', () => {
      const shown = 5
      const stepSize = 10
      const total = shown + stepSize - 1
      const left = total - shown
      renderShowMoreOrAll({ moreStep: stepSize, shown: shown, total: total })

      expect(screen.getByText(`Show ${left} more`)).toBeInTheDocument()
      expect(screen.getByText(`Show all`)).toBeInTheDocument()
    })
  })
})
