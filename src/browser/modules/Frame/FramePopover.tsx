import * as React from 'react'
import { StyledFramePopover } from './styled'

// eslint-disable-next-line react/prop-types
const FramePopover: React.FC = ({ children }) => (
  <StyledFramePopover>{children}</StyledFramePopover>
)

export default FramePopover
