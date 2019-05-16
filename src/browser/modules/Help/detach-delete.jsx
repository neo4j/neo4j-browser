import React from 'react'

const title = 'DETACH DELETE'
const subtitle = 'Delete all nodes and relationships'
const content = (
  <React.Fragment>
    <p>
      The <code>DETACH DELETE</code> clause is used to delete all nodes and
      relationships.
    </p>
    <div className='links'>
      <div className='link'>
        <p className='title'>Reference</p>
        <p className='content'>
          <code>
            <a
              target='_blank'
              href='https://neo4j.com/docs/developer-manual/3.2/cypher/clauses/delete/'
            >
              DELETE
            </a>{' '}
            manual page
          </code>
        </p>
      </div>
      <div className='link'>
        <p className='title'>Related</p>
        <p className='content'>
          <a help-topic='delete'>:help DELETE</a>
        </p>
      </div>
    </div>
    <section className='example'>
      <figure className='runnable'>
        <pre>MATCH (n) DETACH DELETE n</pre>
        <figcaption>Delete all nodes and relationships.</figcaption>
      </figure>
    </section>
  </React.Fragment>
)

export default { title, subtitle, content }
