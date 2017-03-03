import React from 'react'
import Visible from 'components/Visible'
import FrameTemplate from './FrameTemplate'

const ParamsFrame = ({frame, params}) => {
  return (
    <FrameTemplate
      header={frame}
      contents={<Visible if={frame.success !== false}><pre>{JSON.stringify(frame.params, null, 2)}</pre></Visible>}
    >
      <Visible if={frame.success}><span>Successfully set your parameters</span></Visible>
      <Visible if={frame.success === false}><span>Something went wrong. Read help pages.</span></Visible>
    </FrameTemplate>
  )
}
export default ParamsFrame
