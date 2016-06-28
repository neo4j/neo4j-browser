import React from 'react'
import guides from '../../../../guides'
import { FrameTitlebar } from './FrameTitlebar'

export const PlayFrame = ({frame}) => {
  let guide = 'Play guide not specified'
  if (frame.contents) {
    guide = <guides.components.Slide html={frame.contents}/>
  } else {
    const guideName = frame.cmd.replace(':play', '').trim()
    if (guideName !== '') {
      const content = guides.html[guideName]
      if (content !== undefined) {
        guide = <guides.components.Slide html={guides.html[guideName]}/>
      } else {
        guide = 'Guide not found'
      }
    }
  }
  return (
    <div className='playFrame frame'>
      <FrameTitlebar frame={frame} />
      <div className='frame-contents'>{guide}</div>
    </div>
    )
}
