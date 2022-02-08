import React from 'react'

import {
  StyledZoomInfo,
  StyledZoomInfoCheckbox,
  StyledZoomInfoCheckboxLabel,
  StyledZoomInfoIconContainer,
  StyledZoomInfoOverlay,
  StyledZoomInfoText,
  StyledZoomInfoTextContainer
} from './styled'
import { InfoIcon } from 'browser-components/icons/Icons'
import { isMac } from 'shared/utils/platformUtils'

const getModKeyString = () => (isMac ? 'Cmd' : 'Ctrl or Shift')

type WheelZoomInfoProps = {
  hide: boolean
  onDisableWheelZoomInfoMessage: () => void
}
export const WheelZoomInfoOverlay = ({
  hide,
  onDisableWheelZoomInfoMessage
}: WheelZoomInfoProps) => {
  const handleCheckBoxClick = () => {
    onDisableWheelZoomInfoMessage()
  }
  return (
    <StyledZoomInfoOverlay>
      <StyledZoomInfo hide={hide}>
        <StyledZoomInfoTextContainer>
          <StyledZoomInfoIconContainer>
            <InfoIcon />
          </StyledZoomInfoIconContainer>
          <StyledZoomInfoText>{`Use ${getModKeyString()} + scroll to zoom`}</StyledZoomInfoText>
        </StyledZoomInfoTextContainer>

        <StyledZoomInfoCheckbox>
          <input
            type="checkbox"
            id="wheelZoomInfoCheckbox"
            onClick={handleCheckBoxClick}
          />
          <StyledZoomInfoCheckboxLabel htmlFor="wheelZoomInfoCheckbox">
            {`Don't show again`}
          </StyledZoomInfoCheckboxLabel>
        </StyledZoomInfoCheckbox>
      </StyledZoomInfo>
    </StyledZoomInfoOverlay>
  )
}
