import React from 'react'

const title = 'STARTS WITH'
const subtitle = 'Matching the start of a string'
const content = (
  <React.Fragment>
    <p>
      The start of strings can be matched using <code>STARTS WITH</code>. The
      matching is case-sensitive.
    </p>
    <div className='links'>
      <div className='link'>
        <p className='title'>Reference</p>
        <p className='content'>
          <code>
            <a
              target='_blank'
              href='https://neo4j.com/docs/developer-manual/3.2/cypher/clauses/where/'
            >
              WHERE
            </a>{' '}
            manual page
          </code>
        </p>
      </div>
      <div className='link'>
        <p className='title'>Related</p>
        <p className='content'>
          <a help-topic='ends-with'>:help ENDS WITH</a>{' '}
          <a help-topic='contains'>:help CONTAINS</a>
        </p>
      </div>
    </div>
    <section className='example'>
      <figure className='runnable'>
        <pre>{`MATCH (director:Person)
WHERE director.name STARTS WITH 'Pet'
RETURN director.name`}</pre>
        <figcaption>
          Match directors with a name that starts with "Pet".
        </figcaption>
      </figure>
    </section>
  </React.Fragment>
)

export default { title, subtitle, content }
