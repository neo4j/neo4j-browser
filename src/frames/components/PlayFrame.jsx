import React from 'react'
import guides from '../../guides'

export const PlayFrame = ({command}) => {
  const guideName = command.replace(':play', '').trim()
  const guide = () => {
    if (guideName !== '') {
      const content = guides.html[guideName]
      if (content !== undefined) {
        return (
          <div>
            <guides.components.Slide html={guides.html[guideName]}/>
          </div>
        )
      } else {
        return 'Guide not found'
      }
    }
    return 'Play guide not specified'
  }
  return (
    <div className='playFrame frame'>
      {guide()}
    </div>
    )
}
