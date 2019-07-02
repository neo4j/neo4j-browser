import React from 'react'

const title = 'REMOVE'
const subtitle = 'Remove properties and labels'
const category = 'cypherHelp'
const content = (
  <React.Fragment>
    <p>
      The <code>REMOVE</code> clause is used to remove properties and labels
      from graph elements.
    </p>
    <div className='links'>
      <div className='link'>
        <p className='title'>Reference</p>
        <p className='content'>
          <code>
            <a
              target='_blank'
              href='https://neo4j.com/docs/developer-manual/3.2/cypher/clauses/remove/'
            >
              REMOVE
            </a>{' '}
            manual page
          </code>
        </p>
      </div>
      <div className='link'>
        <p className='title'>Related</p>
        <p className='content'>
          <a help-topic='match'>:help MATCH</a>
          <a help-topic='where'>:help WHERE</a>
          <a help-topic='return'>:help RETURN</a>
          <a help-topic='delete'>:help DELETE</a>
          <a help-topic='cypher'>:help Cypher</a>
        </p>
      </div>
    </div>
    <section className='example'>
      <figure className='runnable'>
        <pre>{`MATCH (soren {name: 'Soren'})
REMOVE soren.age
RETURN soren`}</pre>
        <figcaption>Remove Soren's age.</figcaption>
      </figure>
      <figure className='runnable'>
        <pre>{`MATCH (soren {name: 'Soren'})
REMOVE soren:Intern
RETURN soren`}</pre>
        <figcaption>Soren is no longer an intern.</figcaption>
      </figure>
    </section>
  </React.Fragment>
)

export default { title, subtitle, category, content }
