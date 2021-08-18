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

import { ExclamationTriangleIcon } from 'browser-components/icons/Icons'
import Ellipsis from 'browser-components/Ellipsis'
import { stringModifier } from 'services/bolt/cypherTypesFormatting'
import { stringifyMod } from 'services/utils'
import FrameTemplate from '../Frame/FrameTemplate'
import { PaddedDiv, ErrorText, SuccessText, StyledStatsBar } from './styled'
import { applyGraphTypes } from 'services/bolt/boltMappings'
import AutoExecButton from './auto-exec-button'

const ParamsFrame = ({ frame }: any) => {
  const params = applyGraphTypes(frame.params)
  const contents = (
    <PaddedDiv>
      {frame.success !== false && (
        <pre data-testid="rawParamData">
          {stringifyMod(params, stringModifier, true)}
        </pre>
      )}
      <div style={{ marginTop: '20px' }}>
        See <AutoExecButton cmd="help param" /> for usage of the{' '}
        <code>:param</code> command.
      </div>
    </PaddedDiv>
  )
  const statusbar =
    typeof frame.success === 'undefined' ? null : (
      <StyledStatsBar>
        <Ellipsis>
          {frame.success === true && (
            <SuccessText>Successfully set your parameters.</SuccessText>
          )}
          {frame.success === false && (
            <ErrorText>
              <ExclamationTriangleIcon /> Something went wrong. Read help pages.
            </ErrorText>
          )}
        </Ellipsis>
      </StyledStatsBar>
    )
  return (
    <FrameTemplate header={frame} contents={contents} statusbar={statusbar} />
  )
}
export default ParamsFrame
