import React from 'react'

const CypherFrame = ({frame}) => {
  const errors = frame.errors && frame.errors.fields || false
  const result = frame.result || false
  let frameContents = JSON.stringify(result)
  if (errors) {
    frameContents = (
      <div>
        {errors[0].code}
        <pre>{errors[0].message}</pre>
      </div>
    )
  }
  return <div className='frame'>{frameContents}</div>
}

export {
  CypherFrame
}
