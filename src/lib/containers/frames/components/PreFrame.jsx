import React from 'react'
import { FrameTitlebar } from './FrameTitlebar'
import FrameTemplate from './FrameTemplate'

const PreFrame = ({frame}) => {
  return (
    <FrameTemplate
      header={<FrameTitlebar frame={frame} />}
      contents={<pre>{frame.contents}</pre>}
    />
  )
}

export {
  PreFrame
}
