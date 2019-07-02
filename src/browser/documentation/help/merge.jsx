import React from 'react'

const title = 'MERGE'
const subtitle = 'Create missing graph data'
const category = 'cypherHelp'
const content = (
  <React.Fragment>
    <p>
      The <code>MERGE</code> clause ensures that an expected pattern exists in
      the graph, reconciling whether data was found, or needs to be created
      through sub-clauses <code>ON CREATE</code> and <code>ON MATCH</code>
    </p>
    <div className='links'>
      <div className='link'>
        <p className='title'>Reference</p>
        <p className='content'>
          <code>
            <a
              target='_blank'
              href='https://neo4j.com/docs/developer-manual/3.2/cypher/clauses/merge/'
            >
              MERGE
            </a>{' '}
            manual page
          </code>
          <code>
            <a
              target='_blank'
              href='https://neo4j.com/docs/developer-manual/3.2/cypher/clauses/merge/#query-merge-on-create-on-match'
            >
              ON CREATE
            </a>{' '}
            manual page
          </code>
          <code>
            <a
              target='_blank'
              href='https://neo4j.com/docs/developer-manual/3.2/cypher/clauses/merge/#query-merge-on-create-on-match'
            >
              ON MATCH
            </a>{' '}
            manual page
          </code>
        </p>
      </div>
      <div className='link'>
        <p className='title'>Related</p>
        <p className='content'>
          <a help-topic='match'>:help MATCH</a>
          <a help-topic='create'>:help CREATE</a>
          <a help-topic='cypher'>:help Cypher</a>
        </p>
      </div>
    </div>
    <section className='example'>
      <figure className='runnable'>
        <pre>{`MERGE (charlie:Person { name:'Charlie Sheen', age:10 })
RETURN charlie`}</pre>
        <figcaption>
          Look for a person named Charlie Sheen, age 10. If not found, create
          such a person.
        </figcaption>
      </figure>
    </section>
  </React.Fragment>
)

export default { title, subtitle, category, content }
