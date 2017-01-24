import React from 'react'
import FrameTitlebar from './FrameTitlebar'
import FrameTemplate from './FrameTemplate'

const StyleFrame = (props) => {
  const frame = props.frame
  return (
    <FrameTemplate
      header={<FrameTitlebar frame={frame} />}
      contents={'NA'}
    />
  )
}
export default StyleFrame
