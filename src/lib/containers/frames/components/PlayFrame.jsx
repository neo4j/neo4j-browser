import React from 'react'
import guides from '../../../../guides'
import { FrameTitlebar } from './FrameTitlebar'
import FrameTemplate from './FrameTemplate'

export const PlayFrame = ({frame}) => {
  let guide = 'Play guide not specified'
  if (frame.result) {
    guide = <guides.components.Slide html={frame.result}/>
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
    <FrameTemplate
      className='playFrame'
      header={<FrameTitlebar frame={frame} />}
      contents={guide}
    />
    )
}
