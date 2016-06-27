import React from 'react'
import { FrameTitlebar } from './FrameTitlebar'

const Frame = ({frame}) => {
  const errors = frame.errors || false
  const contents = frame.contents || false
  let frameContents = contents
  if (errors) {
    frameContents = (
      <div>
        <pre>{errors.message}</pre>
      </div>
    )
  } else if (frame.type === 'unknown') {
    frameContents = 'Unknown command'
  }
  return (
    <div className='frame'>
      <FrameTitlebar frame={frame} />
      <div className='frame-contents'>{frameContents}</div>
    </div>
  )
}

export {
  Frame
}
