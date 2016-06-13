import React from 'react'

const FrameTitlebar = ({frame, handleTitlebarClick, handleCloseClick}) => {
  return (
    <div className='frame-titlebar'>
      <div className='left'>
        <span onClick={handleTitlebarClick} className='frame-titlebar-cmd'>{frame.cmd}</span>
      </div>
      <div className='right'>
        <div onClick={handleCloseClick} className='frame-action-button'>X</div>
      </div>
      <div className='clear'></div>
    </div>
  )
}

export {
  FrameTitlebar
}
