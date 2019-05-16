import React from 'react'

const title = 'Schema'
const subtitle = 'Database schema indexes'
const content = (
  <React.Fragment>
    <p>Shows information about database schema indexes and constraints.</p>
    <div className='links'>
      <div className='link'>
        <p className='title'>Reference</p>
        <p className='content'>
          <a
            target='_blank'
            href='https://neo4j.com/docs/developer-manual/3.2/cypher/schema/'
          >
            Cypher Schema
          </a>
        </p>
      </div>
      <div className='link'>
        <p className='title'>Related</p>
        <p className='content'>
          <a help-topic='create-index-on'>:help CREATE INDEX ON</a>
          <a help-topic='drop-index-on'>:help DROP INDEX ON</a>
          <a help-topic='create-constraint-on'>:help CREATE CONSTRAINT ON</a>
          <a help-topic='drop-constraint-on'>:help DROP CONSTRAINT ON</a>
        </p>
      </div>
    </div>
    <section className='example'>
      <figure>
        <pre className='code runnable standalone-example'>:schema</pre>
      </figure>
    </section>
  </React.Fragment>
)

export default { title, subtitle, content }
