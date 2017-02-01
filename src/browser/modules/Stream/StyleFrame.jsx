import React from 'react'
import FrameTitlebar from './FrameTitlebar'
import FrameTemplate from './FrameTemplate'

const StyleFrame = ({frame}) => {
  return (
    <FrameTemplate
      header={<FrameTitlebar frame={frame} />}
      contents={<pre>{frame.result || frame.contents}</pre>}
    />
  )
}
export default StyleFrame
