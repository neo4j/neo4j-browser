import React from 'react'
import editor from '../../containers/editor'
import frames from '../../containers/frames'

const QueryView = () => {
  return (
    <div id='query-view'>
      <editor.components.Editor />
      <frames.components.Stream />
    </div>
  )
}

export default QueryView
