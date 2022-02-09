import React from 'react'

import {
  StyledZoomInfo,
  StyledZoomInfoIconContainer,
  StyledZoomInfoOverlay,
  StyledZoomInfoOverlayDoNotDisplayButton,
  StyledZoomInfoText,
  StyledZoomInfoTextContainer
} from './styled'
import { InfoIcon } from 'browser-components/icons/Icons'
import { isMac } from 'shared/utils/platformUtils'

const getModKeyString = () => (isMac ? 'Cmd' : 'Ctrl or Shift')

type WheelZoomInfoProps = {
  onDisableWheelZoomInfoMessage: () => void
}
export const WheelZoomInfoOverlay = ({
  onDisableWheelZoomInfoMessage
}: WheelZoomInfoProps) => {
  const handleCheckBoxClick = () => {
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
          id="wheelZoomInfoCheckbox"
          onClick={handleCheckBoxClick}
        >
          {"Don't show again"}
        </StyledZoomInfoOverlayDoNotDisplayButton>
      </StyledZoomInfo>
    </StyledZoomInfoOverlay>
  )
}
