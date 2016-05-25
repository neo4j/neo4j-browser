import React from 'react'

const FrameTitlebar = ({frame, handleTitlebarClick}) => {
  return (
    <div className='frame-titlebar'>
      <span onClick={() => handleTitlebarClick(frame.cmd)} className='frame-titlebar-cmd'>{frame.cmd}</span>
    </div>
  )
}

export {
  FrameTitlebar
}
