import React from 'react'
import editor from '../../editor'
import frames from '../../frames'

const Main = () => {
  return (
    <div id='main'>
      <editor.components.Editor />
      <frames.components.Stream />
    </div>
  )
}

export default Main
