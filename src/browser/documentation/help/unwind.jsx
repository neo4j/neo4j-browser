import React from 'react'

const title = 'UNWIND'
const subtitle = 'Unwind a collection into a sequence of rows'
const category = 'cypherHelp'
const content = (
  <React.Fragment>
    <p>
      The <code>UNWIND</code> expands a collection in to a sequence of rows. Any
      existing identifiers are still available after <code>UNWIND</code>.
    </p>
    <div className='links'>
      <div className='link'>
        <p className='title'>Reference</p>
        <p className='content'>
          <code>
            <a
              target='_blank'
              href='https://neo4j.com/docs/developer-manual/3.2/cypher/clauses/unwind/'
            >
              UNWIND
            </a>{' '}
            manual page
          </code>
        </p>
      </div>
      <div className='link'>
        <p className='title'>Related</p>
        <p className='content'>
          <a help-topic='match'>:help MATCH</a>
          <a help-topic='cypher'>:help Cypher</a>
        </p>
      </div>
    </div>
    <section className='example'>
      <figure className='runnable'>
        <pre
        >{`MATCH p = shortestPath( (lucy:Person {name:"Lucy Liu"})-[:ACTED_IN*]-(bacon:Person {name:"Kevin Bacon"}) )
UNWIND nodes(p) as n
RETURN n.name`}</pre>
        <figcaption>
          Return a set of actors that form the shortest acquaintance links
          between Lucy Liu and Kevin Bacon.
        </figcaption>
      </figure>
    </section>
  </React.Fragment>
)

export default { title, subtitle, category, content }
