import styled from 'styled-components'

import { StyledFrameCommand } from 'browser/modules/Frame/styled'
import { StyledStatsBar } from 'browser/modules/Stream/styled'

export const WrapperCenter = styled.div`
  display: flex;
  width: 90%;
  margin: 35px auto;
`

export const ContentSizer = styled.div`
  flex: 1;
  min-width: 0;
`

export const MessageArea = styled.pre`
  padding-left: 10px;
  background-color: ${props => props.theme.preBackground};
  white-space: pre-wrap;
`

export const PaddedStatsBar = styled(StyledStatsBar)`
  padding: 0 15px 15px 24px;
`

export const PointerFrameCommand = styled(StyledFrameCommand)`
  cursor: pointer;
`

export const WarningSpan = styled.span`
  color: ${props => props.theme.warning};
`
export const ErrorSpan = styled.span`
  color: ${props => props.theme.error};
`
export const SuccessSpan = styled.span`
  color: ${props => props.theme.success};
`
