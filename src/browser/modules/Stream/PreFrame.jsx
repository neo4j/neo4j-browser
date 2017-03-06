import FrameTemplate from './FrameTemplate'

const PreFrame = ({frame}) => {
  return (
    <FrameTemplate
      header={frame}
      contents={<pre>{frame.result || frame.contents}</pre>}
    />
  )
}
export default PreFrame
