import React from 'react'

const FrameSuccess = (props) => {
  if (!props || !props.message) return null
  return <span style={{color: 'green'}}>{props.message}</span>
}

export default FrameSuccess
