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

import { InfoIcon, isMac } from '../../../common'

import {
  StyledZoomInfo,
  StyledZoomInfoIconContainer,
  StyledZoomInfoOverlay,
  StyledZoomInfoOverlayDoNotDisplayButton,
  StyledZoomInfoText,
  StyledZoomInfoTextContainer
} from './styled'

const getModKeyString = () => (isMac ? 'Cmd' : 'Ctrl or Shift')

type WheelZoomInfoProps = {
  onDisableWheelZoomInfoMessage: () => void
}
export const WheelZoomInfoOverlay = ({
  onDisableWheelZoomInfoMessage
}: WheelZoomInfoProps) => {
  const handleDoNotDisplayAgainClick = () => {
    onDisableWheelZoomInfoMessage()
  }
  return (
    <StyledZoomInfoOverlay>
      <StyledZoomInfo>
        <StyledZoomInfoTextContainer>
          <StyledZoomInfoIconContainer>
            <InfoIcon />
          </StyledZoomInfoIconContainer>
          <StyledZoomInfoText>{`Use ${getModKeyString()} + scroll to zoom`}</StyledZoomInfoText>
        </StyledZoomInfoTextContainer>
        <StyledZoomInfoOverlayDoNotDisplayButton
          data-testid="wheelZoomInfoCheckbox"
          onClick={handleDoNotDisplayAgainClick}
        >
          {"Don't show again"}
        </StyledZoomInfoOverlayDoNotDisplayButton>
      </StyledZoomInfo>
    </StyledZoomInfoOverlay>
  )
}
