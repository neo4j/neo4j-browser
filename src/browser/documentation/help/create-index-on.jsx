import React from 'react'

const title = 'CREATE INDEX ON'
const subtitle = 'Index labeled nodes by property'
const content = (
  <React.Fragment>
    <p>
      The <code>CREATE INDEX ON</code> clause will create and populate an index
      on a property for all nodes that have a label.
    </p>
    <div className='links'>
      <div className='link'>
        <p className='title'>Reference</p>
        <p className='content'>
          <a
            target='_blank'
            href='https://neo4j.com/docs/developer-manual/preview/cypher/schema/index/'
          >
            <code>schema indexes</code> manual page
          </a>
        </p>
      </div>
      <div className='link'>
        <p className='title'>Related</p>
        <p className='content'>
          <a help-topic='drop-index-on'>:help DROP INDEX ON</a>{' '}
          <a help-topic='cypher'>:help Cypher</a>
        </p>
      </div>
    </div>
    <section className='example'>
      <figure>
        <pre className='code runnable standalone-example'>
          {'CREATE INDEX ON :Person(name)'}
        </pre>
        <figcaption>
          Create index on name for all nodes with a Person label.
        </figcaption>
      </figure>
    </section>
  </React.Fragment>
)

export default { title, subtitle, content }
