import React from 'react'
import Editor from './Editor'
import Stream from './Stream'

export default class Main extends React.Component {
  render () {
    return (
      <div id='main'>
        <Editor />
        <Stream />
      </div>
    )
  }
}
