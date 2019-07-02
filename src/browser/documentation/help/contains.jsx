import React from 'react'

const title = 'CONTAINS'
const subtitle = 'Matching within in a string'
const category = 'cypherPredicates'
const content = (
  <React.Fragment>
    <p>
      The occurrence of a string within a string can be matched using{' '}
      <code>CONTAINS</code>. The matching is case-sensitive.
    </p>
    <div className='links'>
      <div className='link'>
        <p className='title'>Reference</p>
        <p className='content'>
          <a
            target='_blank'
            href='https://neo4j.com/docs/developer-manual/3.2/cypher/clauses/where/#query-where-string'
          >
            WHERE
          </a>{' '}
          manual page
        </p>
      </div>
      <div className='link'>
        <p className='title'>Related</p>
        <p className='content'>
          <a help-topic='starts-with'>:help STARTS WITH</a>{' '}
          <a help-topic='ends-with'>:help ENDS WITH</a>
        </p>
      </div>
    </div>
    <section className='example'>
      <figure>
        <pre className='code runnable standalone-example'>
          MATCH (director:Person) WHERE director.name CONTAINS 'ete' RETURN
          director.name
        </pre>
        <figcaption>
          Match directors with a name that contains with "eter".
        </figcaption>
      </figure>
    </section>
  </React.Fragment>
)

export default { title, subtitle, category, content }
