import React from 'react'
import { FrameTitlebar } from './FrameTitlebar'

const WidgetFrame = (props) => {
  return (
    <div className='frame'>
      <FrameTitlebar frame={props.frame} />
      <div className='frame-contents'>
        hello
      </div>
    </div>
  )
}

export {
  WidgetFrame
}
