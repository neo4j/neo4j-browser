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

import { ExclamationTriangleIcon } from 'browser-components/icons/LegacyIcons'

import FrameBodyTemplate from '../Frame/FrameBodyTemplate'
import AutoExecButton from './auto-exec-button'
import { ErrorText, PaddedDiv, StyledStatsBar, SuccessText } from './styled'
import Ellipsis from 'browser-components/Ellipsis'
import { applyGraphTypes } from 'services/bolt/boltMappings'
import { stringModifier } from 'services/bolt/cypherTypesFormatting'
import { stringifyMod } from 'services/utils'

const ParamsFrame = ({ frame, isCollapsed, isFullscreen }: any) => {
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
        <code>:param</code> command (setting one parameter).
      </div>
      <div style={{ marginTop: '5px' }}>
        See <AutoExecButton cmd="help params" /> for usage of the{' '}
        <code>:params</code> command (setting multiple parameters).
      </div>
    </PaddedDiv>
  )
  const statusBar =
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
    <FrameBodyTemplate
      isCollapsed={isCollapsed}
      isFullscreen={isFullscreen}
      contents={contents}
      statusBar={statusBar}
    />
  )
}
export default ParamsFrame
