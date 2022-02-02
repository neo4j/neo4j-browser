import React, { ChangeEvent, useState } from 'react'

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

const getModKeyString = () => {
  const isOnMacComputer = navigator.appVersion.indexOf('Mac') !== -1
  if (isOnMacComputer) {
    return 'Cmd'
  } else {
    return 'Ctrl or Shift'
  }
}

type WheelZoomInfoProps = {
  hide: boolean
  onShouldShowUpdate: (show: boolean) => void
}
export const WheelZoomInfoOverlay = ({
  hide,
  onShouldShowUpdate
}: WheelZoomInfoProps) => {
  const [doNotShowAgain, setDoNotShowAgain] = useState<boolean>(false)
  const handleCheckBoxChange = (event: ChangeEvent<HTMLInputElement>) => {
    const doNotShow = event.currentTarget.checked
    setDoNotShowAgain(doNotShow)
    onShouldShowUpdate(!doNotShow)
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
            checked={doNotShowAgain}
            onChange={handleCheckBoxChange}
          />
          <StyledZoomInfoCheckboxLabel htmlFor="wheelZoomInfoCheckbox">
            {`Don't show again`}
          </StyledZoomInfoCheckboxLabel>
        </StyledZoomInfoCheckbox>
      </StyledZoomInfo>
    </StyledZoomInfoOverlay>
  )
}
