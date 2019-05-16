import React from 'react'

const title = 'ENDS WITH'
const subtitle = 'Matching the end of a string'
const content = (
  <React.Fragment>
    <p>
      The end of strings can be matched using <code>ENDS WITH</code>. The
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
          <a help-topic='starts-with'>:help STARTS WITH</a>
          <a help-topic='contains'>:help CONTAINS</a>
        </p>
      </div>
    </div>
    <section className='example'>
      <figure className='runnable'>
        <pre>
          MATCH (director:Person) WHERE director.name ENDS WITH 'ter' RETURN
          director.name
        </pre>
        <figcaption>
          Match directors with a name that ends with "ter".
        </figcaption>
      </figure>
    </section>
  </React.Fragment>
)

export default { title, subtitle, content }
