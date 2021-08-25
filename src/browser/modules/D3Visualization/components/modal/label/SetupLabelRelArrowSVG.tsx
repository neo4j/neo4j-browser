import * as React from 'react'
import styled from 'styled-components'
import { ICaptionSettingsStore } from 'project-root/src/browser/modules/D3Visualization/components/modal/label/SetupLabelStorage'
import {
  allLabelPositions,
  ICaptionSettings
} from 'project-root/src/browser/modules/D3Visualization/components/modal/label/SetupLabelModal'

const SVG = styled.svg`
  position: absolute;
  top: 20px;
  left: 20px;
  height: 80px;
  width: 150px;
  pointer-events: all;
`
const Line = styled.line`
  stroke: ${({ theme }) => theme.primaryText};
`
const Path = styled.path`
  fill: ${({ theme }) => theme.primaryText};
`
const y = 40
const strokeWidth = 4
const center = 150 / 2
const start = 20
const end = 150 - 20
const arrowHeight = 20

export enum RelArrowCaptionPosition {
  center,
  startAbove,
  startBelow,
  endAbove,
  endBelow
}

interface IGenericProps {
  position: RelArrowCaptionPosition
  setPosition: (pos: RelArrowCaptionPosition) => void
}

interface IProps extends IGenericProps {
  store: ICaptionSettingsStore
}

const SetupLabelRelArrowSVG: React.FC<IProps> = ({ store, ...rest }) => {
  const filledPositions: { [p: string]: boolean } = React.useMemo(() => {
    const result: {
      [key: string]: boolean
    } = {}
    const keys = Object.keys(store)
    for (const key of keys) {
      if (store.hasOwnProperty(key)) {
        const parsedKey = (key as unknown) as RelArrowCaptionPosition
        const value: ICaptionSettings = store[parsedKey]
        if (
          allLabelPositions.some(
            position => value[position].caption != undefined
          )
        ) {
          result[parsedKey] = true
        }
      }
    }
    return result
  }, [store])
  return (
    <SVG>
      <rect x={0} y={0} width={150} height={150} fill={'transparent'} />
      <Line
        x1={0}
        x2={141}
        y1={y}
        y2={y}
        strokeWidth={strokeWidth}
        stroke={'#FFF'}
      />
      <Path
        d={`M 140 ${y - arrowHeight / 2} L 150 ${y} L 140 ${y +
          arrowHeight / 2} Z`}
        fill={'#FFF'}
      />
      <CircleNodeMemoed
        x={center}
        y={y}
        value={RelArrowCaptionPosition.center}
        filledPositions={filledPositions}
        {...rest}
      />
      <CircleNodeMemoed
        x={start}
        y={y - arrowHeight}
        value={RelArrowCaptionPosition.startAbove}
        filledPositions={filledPositions}
        {...rest}
      />
      <CircleNodeMemoed
        x={start}
        y={y + arrowHeight}
        value={RelArrowCaptionPosition.startBelow}
        filledPositions={filledPositions}
        {...rest}
      />
      <CircleNodeMemoed
        x={end}
        y={y - arrowHeight}
        value={RelArrowCaptionPosition.endAbove}
        filledPositions={filledPositions}
        {...rest}
      />
      <CircleNodeMemoed
        x={end}
        y={y + arrowHeight}
        value={RelArrowCaptionPosition.endBelow}
        filledPositions={filledPositions}
        {...rest}
      />
    </SVG>
  )
}
const SetupLabelRelArrowSVGMemoed = React.memo(SetupLabelRelArrowSVG)

interface ICircleNodeProps extends IGenericProps {
  filledPositions: { [p: string]: boolean }
  value: RelArrowCaptionPosition
  x: number
  y: number
}

const Circle = styled.circle`
  cursor: pointer;
`
const CircleNode: React.FC<ICircleNodeProps> = ({
  x,
  y,
  value,
  setPosition,
  position,
  filledPositions
}) => (
  <Circle
    onClick={React.useCallback(() => setPosition(value), [setPosition, value])}
    fill={React.useMemo(() => (value === position ? '#78ec71' : '#50a2ce'), [
      value,
      position
    ])}
    stroke={
      value === position
        ? filledPositions[value]
          ? '#8cff00'
          : '#0c2303'
        : filledPositions[value]
        ? '#03d2ff'
        : '#2d4f56'
    }
    strokeWidth={filledPositions[value] ? 2 : 1}
    cx={x}
    cy={y}
    r={10}
  />
)
const CircleNodeMemoed = React.memo(CircleNode)
export default SetupLabelRelArrowSVGMemoed
