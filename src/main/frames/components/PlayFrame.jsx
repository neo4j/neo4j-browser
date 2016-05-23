import React from 'react'
import guides from '../../../guides'

export const PlayFrame = ({command, contents}) => {
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
      {guide}
    </div>
    )
}
