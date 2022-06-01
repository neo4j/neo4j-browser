import * as React from 'react'
import styled from 'styled-components'

const SVGTop = styled.svg`
  vertical-align: top;
`
const SVGMiddle = styled.svg`
  vertical-align: middle;
`
const size = 20
const sizeSmall = 14
export function ArrowLeft() {
  return (
    <SVGTop height={size} viewBox="0 0 512 512" width={size}>
      <g
        fill="none"
        stroke="#000"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="48"
      >
        <path d="m244 400-144-144 144-144" />
        <path d="m120 256h292" />
      </g>
    </SVGTop>
  )
}

export function ArrowRight() {
  return (
    <SVGTop height={size} viewBox="0 0 512 512" width={size}>
      <g
        fill="none"
        stroke="#000"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="48"
      >
        <path d="m268 112 144 144-144 144" />
        <path d="m392 256h-292" />
      </g>
    </SVGTop>
  )
}

export function AddIcon() {
  return (
    <SVGMiddle width={sizeSmall} height={sizeSmall} viewBox="0 0 512 512">
      <path d="M256,48C141.31,48,48,141.31,48,256s93.31,208,208,208,208-93.31,208-208S370.69,48,256,48Zm80,224H272v64a16,16,0,0,1-32,0V272H176a16,16,0,0,1,0-32h64V176a16,16,0,0,1,32,0v64h64a16,16,0,0,1,0,32Z" />
    </SVGMiddle>
  )
}

export function RemoveIcon() {
  return (
    <SVGMiddle width={sizeSmall} height={sizeSmall} viewBox="0 0 512 512">
      <path d="M256,48C141.31,48,48,141.31,48,256s93.31,208,208,208,208-93.31,208-208S370.69,48,256,48Zm80,224H176a16,16,0,0,1,0-32H336a16,16,0,0,1,0,32Z" />
    </SVGMiddle>
  )
}
