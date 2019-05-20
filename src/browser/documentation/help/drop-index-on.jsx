import React from 'react'

const title = 'DROP INDEX ON'
const subtitle = 'Drop a schema index'
const content = (
  <React.Fragment>
    <p>
      The <code>DROP INDEX ON</code> clause will an index on all nodes that have
      a label.
    </p>
    <div className='links'>
      <div className='link'>
        <p className='title'>Reference</p>
        <p className='content'>
          <code>
            <a
              target='_blank'
              href='https://neo4j.com/docs/developer-manual/3.2/cypher/schema/index/'
            >
              schema indexes
            </a>{' '}
            manual page
          </code>
        </p>
      </div>
      <div className='link'>
        <p className='title'>Related</p>
        <p className='content'>
          <a help-topic='create-index-on'>:help CREATE INDEX ON</a>
          <a help-topic='cypher'>:help Cypher</a>
        </p>
      </div>
    </div>
    <section className='example'>
      <figure className='runnable'>
        <pre>{`DROP INDEX ON :Person(name)`}</pre>
      </figure>
    </section>
  </React.Fragment>
)

export default { title, subtitle, content }
