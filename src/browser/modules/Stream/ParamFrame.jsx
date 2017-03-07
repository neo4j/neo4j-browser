import Visible from 'components/Visible'
import FrameTemplate from './FrameTemplate'

const ParamFrame = ({frame, params}) => {
  return (
    <FrameTemplate
      header={frame}
      contents={<Visible if={frame.success}><pre>{JSON.stringify(frame.params, null, 2)}</pre></Visible>}
    >
      <Visible if={frame.success}><span>Successfully set your parameter</span></Visible>
      <Visible if={!frame.success}><span>Something went wrong. Read help pages.</span></Visible>
    </FrameTemplate>
  )
}
export default ParamFrame
