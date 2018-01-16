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

import Render from 'browser-components/Render'
import FrameTemplate from './FrameTemplate'
import { ExclamationTriangleIcon } from 'browser-components/icons/Icons'
import Ellipsis from 'browser-components/Ellipsis'
import { PaddedDiv, ErrorText, SuccessText, StyledStatsBar } from './styled'

const ParamsFrame = ({ frame, params }) => {
  const contents = (
    <PaddedDiv>
      <Render if={frame.success !== false}>
        <pre>{JSON.stringify(frame.params, null, 2)}</pre>
      </Render>
    </PaddedDiv>
  )
  const statusbar =
    typeof frame['success'] === 'undefined' ? null : (
      <StyledStatsBar>
        <Ellipsis>
          <Render if={frame.success === true}>
            <SuccessText>Successfully set your parameters.</SuccessText>
          </Render>
          <Render if={frame.success === false}>
            <ErrorText>
              <ExclamationTriangleIcon /> Something went wrong. Read help pages.
            </ErrorText>
          </Render>
        </Ellipsis>
      </StyledStatsBar>
    )
  return (
    <FrameTemplate header={frame} contents={contents} statusbar={statusbar} />
  )
}
export default ParamsFrame
