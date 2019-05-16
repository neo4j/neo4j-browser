import React from 'react'

const title = 'FOREACH'
const subtitle = 'Operate on a collection'
const content = (
  <React.Fragment>
    <p>
      The <code>FOREACH</code> clause is used to update data within a collection
      whether components of a path, or result of aggregation.
    </p>
    <div className='links'>
      <div className='link'>
        <p className='title'>Reference</p>
        <p className='content'>
          <code>
            <a
              target='_blank'
              href='https://neo4j.com/docs/developer-manual/3.2/cypher/clauses/foreach/'
            >
              FOREACH
            </a>{' '}
            manual page
          </code>
        </p>
      </div>
      <div className='link'>
        <p className='title'>Related</p>
        <p className='content'>
          <a help-topic='create'>:help CREATE</a>
          <a help-topic='delete'>:help DELETE</a>
          <a help-topic='set'>:help SET</a>
          <a help-topic='cypher'>:help Cypher</a>
        </p>
      </div>
    </div>
    <section className='example'>
      <figure className='runnable'>
        <pre>
          MATCH p = (ups)&lt;-[DEPENDS_ON]-(device) WHERE ups.id='EPS-7001'
          FOREACH (n IN nodes(p) | SET n.available = FALSE )
        </pre>
        <figcaption>
          Mark all devices plugged into a failed UPS as unavailable.
        </figcaption>
      </figure>
    </section>
  </React.Fragment>
)

export default { title, subtitle, content }
