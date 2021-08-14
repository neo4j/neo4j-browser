import * as React from 'react'
import styled from 'styled-components'
const SVG = styled.svg`
  position: absolute;
  top: 86px;
  left: 20px;
  height: 20px;
  width: 150px;
  pointer-events: none;
`
const Line = styled.line`
  stroke: ${({ theme }) => theme.primaryText};
`
const Path = styled.path`
  fill: ${({ theme }) => theme.primaryText};
`
const y = 5
const strokeWidth = 4

const SetupLabelRelArrowSVG: React.FC = () => (
  <SVG>
    <Line
      x1={0}
      x2={20}
      y1={y}
      y2={y}
      strokeWidth={strokeWidth}
      stroke={'#FFF'}
    />
    <Line
      x1={130}
      x2={141}
      y1={y}
      y2={y}
      strokeWidth={strokeWidth}
      stroke={'#FFF'}
    />
    <Path d={`M 140 0 L 150 ${y} L 140 ${y * 2} Z`} fill={'#FFF'} />
  </SVG>
)

export default SetupLabelRelArrowSVG
