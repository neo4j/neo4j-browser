import FrameTemplate from './FrameTemplate'

const Frame = ({frame}) => {
  const errors = frame.errors || false
  const contents = frame.contents || false
  let frameContents = contents
  if (errors) {
    frameContents = (
      <div>
        <pre>{errors.message}</pre>
      </div>
    )
  } else if (frame.type === 'unknown') {
    frameContents = 'Unknown command'
  }
  return (
    <FrameTemplate
      header={frame}
      contents={frameContents}
    />
  )
}
export default Frame
