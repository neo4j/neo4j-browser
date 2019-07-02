import React from 'react'

const title = 'CREATE'
const subtitle = 'Insert graph data'
const category = 'cypherHelp'
const content = (
  <React.Fragment>
    <p>
      The
      <code>CREATE</code> clause is used to create data by specifying named
      nodes and relationships with inline properties.
    </p>
    <p>
      Use
      <code>MATCH</code> clauses for reading data, and
      <code>CREATE</code> or
      <code>MERGE</code> for writing data.
    </p>
    <div className='links'>
      <div className='link'>
        <p className='title'>Reference</p>
        <p className='content'>
          <a
            target='_blank'
            href='https://neo4j.com/docs/developer-manual/3.2/cypher/clauses/create/'
          >
            CREATE
          </a>{' '}
          manual page
        </p>
      </div>
      <div className='link'>
        <p className='title'>Related</p>
        <p className='content'>
          <a help-topic='set'>:help SET</a>
          <a help-topic='merge'>:help MERGE</a>
          <a help-topic='cypher'>:help Cypher</a>
        </p>
      </div>
      <div className='link'>
        <p className='title'>Guide</p>
        <p className='content'>
          <a play-topic='cypher'>Cypher</a>
        </p>
      </div>
    </div>
    <section className='example'>
      <figure>
        <pre className='code runnable'>{`CREATE (le:Person {name: Euler }),
  (db:Person {name: Bernoulli }),
  (le)-[:KNOWS {since:1768}]->(db)
  RETURN le, db`}</pre>
        <figcaption>Create two related people, returning them.</figcaption>
      </figure>
    </section>
  </React.Fragment>
)
export default { title, subtitle, category, content }
