import React from 'react'
import { FrameTitlebar } from './FrameTitlebar'

const PreFrame = ({frame}) => {
  return (
    <div className='frame'>
      <FrameTitlebar frame={frame} />
      <div className='frame-contents'><pre>{frame.contents}</pre></div>
    </div>
  )
}

export {
  PreFrame
}
