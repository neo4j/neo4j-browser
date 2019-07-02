import React from 'react'

const title = 'Play'
const subtitle = 'Display a mini-deck'
const category = 'browserUiCommands'
const content = (
  <React.Fragment>
    <p>
      The <code>:play</code> command loads a mini-deck with either guide
      material or sample data.
    </p>
    <div className='links'>
      <div className='link'>
        <p className='title'>Usage:</p>
        <p className='content'>
          <code>{`:play <guide | data>`}</code>
        </p>
      </div>
      <div className='link'>
        <p className='title'>System information:</p>
        <p className='content'>
          <code exec-topic='sysinfo'>:sysinfo</code>
        </p>
      </div>
      <div className='link'>
        <p className='title'>Guides</p>
        <p className='content'>
          <a play-topic='intro'>:play intro</a>
          <a play-topic='concepts'>:play concepts</a>
          <a play-topic='cypher'>:play cypher</a>
        </p>
      </div>
      <div className='link'>
        <p className='title'>Examples:</p>
        <p className='content'>
          <a play-topic='movie graph'>:play movie graph</a>
          <a play-topic='northwind graph'>:play northwind graph</a>
        </p>
      </div>
    </div>
  </React.Fragment>
)

export default { title, subtitle, category, content }
