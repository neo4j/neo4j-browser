import React from 'react'
import guides from '../../../guides'
import { FrameTitlebar } from './FrameTitlebar'

export const PlayFrame = (frame) => {
  const {command, contents} = frame
  let guide = 'Play guide not specified'

  if (contents) {
    guide = <guides.components.Slide html={contents}/>
  } else {
    const guideName = command.replace(':play', '').trim()
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
