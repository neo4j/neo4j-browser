import React from 'react'

const title = 'WITH'
const subtitle = 'A graph query language'
const category = 'cypherHelp'
const content = (
  <React.Fragment>
    <p>
      The <code>WITH</code> clause allows queries to be chained together, piping
      the results from one to be used as starting points or criteria in the
      next.
    </p>
    <div className='links'>
      <div className='link'>
        <p className='title'>Reference</p>
        <p className='content'>
          <code>
            <a
              target='_blank'
              href='https://neo4j.com/docs/developer-manual/3.2/cypher/clauses/with/'
            >
              WITH
            </a>{' '}
            manual page
          </code>
        </p>
      </div>
      <div className='link'>
        <p className='title'>Related</p>
        <p className='content'>
          <a help-topic='match'>:help MATCH</a>{' '}
          <a help-topic='return'>:help RETURN</a>{' '}
          <a help-topic='cypher'>:help Cypher</a>
        </p>
      </div>
    </div>
    <section className='example'>
      <figure className='runnable'>
        <pre>{`MATCH (director:Person)-[:DIRECTED]->(movie)
WITH director, count(movie) as directed ORDER BY directed DESC LIMIT 1
MATCH (hopeful:Person)-[:ACTED_IN]->(movie)
WITH director, hopeful, count(movie) as appearances ORDER BY appearances LIMIT 1
MATCH p=(director)-[*..4]-(hopeful)
RETURN p`}</pre>
        <figcaption>
          Find a path from a hopeful actor to Hollywood's most prolific
          director.
        </figcaption>
      </figure>
    </section>
  </React.Fragment>
)

export default { title, subtitle, category, content }
