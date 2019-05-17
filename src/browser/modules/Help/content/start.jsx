import React from 'react'

const title = 'START'
const subtitle = 'with known data'
const content = (
  <React.Fragment>
    <p>
      The <code>START</code> clause should only be used when accessing legacy
      indexes.
    </p>
    <p>
      In all other cases, use <code>MATCH</code> instead.
    </p>
    <div className='links'>
      <div className='link'>
        <p className='title'>Reference</p>
        <p className='content'>
          <code>
            <a
              target='_blank'
              href='https://neo4j.com/docs/developer-manual/3.2/cypher/clauses/start/'
            >
              START
            </a>{' '}
            manual page
          </code>
        </p>
      </div>
      <div className='link'>
        <p className='title'>Related</p>
        <p className='content'>
          <a help-topic='match'>:help MATCH</a>
          <a help-topic='return'>:help RETURN</a>
          <a help-topic='Cypher'>:help Cypher</a>
        </p>
      </div>
    </div>
  </React.Fragment>
)

export default { title, subtitle, content }
