import { WarningIcon } from '../icons/Icons'
import React from 'react'
import styled from 'styled-components'

export const StyledWarningMessage = styled.span`
  color: orange;
`
type WarningMessageProps = {
  text: string
}
export const WarningMessage = ({ text }: WarningMessageProps): JSX.Element => {
  return (
    <StyledWarningMessage>
      <WarningIcon />
      &nbsp;{text}&nbsp;
    </StyledWarningMessage>
  )
}
