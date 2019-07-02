import React from 'react'

const title = 'SET'
const subtitle = 'property updates'
const category = 'cypherHelp'
const content = (
  <React.Fragment>
    <p>
      The <code>SET</code> clause updates properties on nodes and relationships.
    </p>
    <div className='links'>
      <div className='link'>
        <p className='title'>Reference</p>
        <p className='content'>
          <code>
            <a
              target='_blank'
              href='https://neo4j.com/docs/developer-manual/3.2/cypher/clauses/set/'
            >
              SET
            </a>{' '}
            manual page
          </code>
        </p>
      </div>
      <div className='link'>
        <p className='title'>Related</p>
        <p className='content'>
          <a help-topic='match'>:help MATCH</a>{' '}
          <a help-topic='where'>:help WHERE</a>{' '}
          <a help-topic='cypher'>:help Cypher</a>
        </p>
      </div>
    </div>
    <section className='example'>
      <figure className='runnable'>
        <pre>{`MATCH (fan:Person)-[w:WATCHED]->(movie)
WHERE fan.name = "Mikey"
SET w.rating = 5`}</pre>
        <figcaption>
          Mikey likes everything, so give any movie he has watched 5 stars.
        </figcaption>
      </figure>
    </section>
  </React.Fragment>
)

export default { title, subtitle, category, content }
