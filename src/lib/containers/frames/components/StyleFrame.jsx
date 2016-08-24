import React from 'react'
import { FrameTitlebar } from './FrameTitlebar'
import FrameTemplate from './FrameTemplate'
import visualization from '../../visualization'

const StyleFrame = (props) => {
  const frame = props.frame
  return (
    <FrameTemplate
      header={<FrameTitlebar frame={frame} />}
      contents={<visualization.components.StyleEditor/>}
    />
  )
}

export {
  StyleFrame
}
