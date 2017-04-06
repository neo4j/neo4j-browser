import FrameTemplate from '../FrameTemplate'

const Disconnect = ({frame, activeConnectionData}) => {
  let message = 'You\'re still connected'
  if (!activeConnectionData) message = 'You are now disconnected from the server'
  return (
    <FrameTemplate
      header={frame}
      contents={message}
    />
  )
}

export default Disconnect
