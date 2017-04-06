const FrameError = (props) => {
  if (!props || (!props.code && !props.message)) return null
  return <span style={{color: 'red'}}>{props.code}: {props.message}</span>
}

export default FrameError
