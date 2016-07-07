import React from 'react'
import { FrameTitlebar } from './FrameTitlebar'
import widgets from '../../widgets'

const WidgetFrame = (props) => {
  return (
    <div className='frame'>
      <FrameTitlebar frame={props.frame} />
      <div className='frame-contents'>
        <widgets.components.Widget {...props} />
      </div>
    </div>
  )
}

export {
  WidgetFrame
}
