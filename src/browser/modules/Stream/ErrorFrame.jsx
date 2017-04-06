import FrameTemplate from './FrameTemplate'
import * as e from 'services/exceptionMessages'

const ErrorFrame = ({frame}) => {
  const error = frame.error || false
  let errorContents = error.message || 'No error message found'
  if (error.type && typeof e[error.type] !== 'undefined') {
    errorContents = e[error.type]
  }
  return (
    <FrameTemplate
      header={frame}
      contents={<pre>{errorContents}</pre>}
    />
  )
}
export default ErrorFrame
