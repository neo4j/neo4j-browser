import React from 'react'
import { FrameTitlebar } from './FrameTitlebar'

const Frame = ({frame, handleTitlebarClick, handleCloseClick}) => {
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
      <FrameTitlebar handleCloseClick={() => handleCloseClick(frame.id)} handleTitlebarClick={() => handleTitlebarClick(frame.cmd)} frame={frame} />
      <div className='frame-contents'>{frameContents}</div>
    </div>
  )
}

export {
  Frame
}
