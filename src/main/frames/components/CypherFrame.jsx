import React from 'react'
import { FrameTitlebar } from './FrameTitlebar'
import asciitable from 'ascii-data-table'
import bolt from '../../../services/bolt/bolt'

const CypherFrame = ({frame, handleTitlebarClick}) => {
  const errors = frame.errors && frame.errors.fields || false
  const result = frame.result || false
  let frameContents = <pre>{JSON.stringify(result, null, 2)}</pre>
  if (result) {
    const rows = bolt.recordsToTableArray(result.records)
    frameContents = <pre>{asciitable.run(rows)}</pre>
  } else if (errors) {
    frameContents = (
      <div>
        {errors[0].code}
        <pre>{errors[0].message}</pre>
      </div>
    )
  }
  return (
    <div className='frame'>
      <FrameTitlebar handleTitlebarClick={() => handleTitlebarClick(frame.cmd)} frame={frame} />
      <div className='frame-contents'>{frameContents}</div>
    </div>
  )
}

export {
  CypherFrame
}
