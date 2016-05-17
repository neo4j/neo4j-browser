import React from 'react'
import guides from '../../guides'

export const PlayFrame = ({command}) => {
  const guideName = command.replace('play', '').trim()

  console.log('--------------')
  console.log(command)
  console.log(guideName)
  console.log('--------------')

  const guides = () => {
    if (guideName !== '') {
      return <div><guides.components.Slide html={guides.html[guideName]}/></div>
    }
    return 'Guide not found'
  }
  return (
    <div className='playFrame frame'>
      {guides()}
    </div>
    )
}
