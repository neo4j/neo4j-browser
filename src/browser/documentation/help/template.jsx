import React from 'react'

const title = 'Cypher'
const subtitle = 'A graph query language'
const category = 'cypherQueries'
const content = (
  <React.Fragment>
    <p>
      Cypher is Neo4j's graph query language. Working with a graph is all about
      understanding patterns of data, which are central to Cypher queries.
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
            href='https://neo4j.com/docs/developer-manual/3.2/cypher/'
          >
            Cypher introduction
          </a>
        </p>
      </div>
      <div className='link'>
        <p className='title'>Related</p>
        <p className='content'>
          <a help-topic='match'>:help MATCH</a>
          <a help-topic='where'>:help WHERE</a>
          <a help-topic='return'>:help RETURN</a>
          <a help-topic='create'>:help CREATE</a>
          <a help-topic='merge'>:help MERGE</a>
          <a help-topic='delete'>:help DELETE</a>
          <a help-topic='detach-delete'>:help DETACH DELETE</a>
          <a help-topic='set'>:help SET</a>
          <a help-topic='foreach'>:help FOREACH</a>
          <a help-topic='with'>:help WITH</a>
          <a help-topic='load-csv'>:help LOAD CSV</a>
          <a help-topic='unwind'>:help UNWIND</a>
          <a help-topic='start'>:help START</a>
          <a help-topic='create-index-on'>:help CREATE INDEX ON</a>
          <a help-topic='starts-with'>:help STARTS WITH</a>
          <a help-topic='ends-with'>:help ENDS WITH</a>
          <a help-topic='contains'>:help CONTAINS</a>
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
        <pre>{`MATCH <pattern> WHERE <conditions> RETURN
<expressions>`}</pre>
        <figcaption>
          Basic form of a Cypher read statement. (Not executable)
        </figcaption>
      </figure>
      <figure className='runnable'>
        <pre>ANOTHER EXAMPLE</pre>
        <figcaption>
          Basic form of a Cypher read statement. (executable)
        </figcaption>
      </figure>
    </section>
  </React.Fragment>
)

export default { title, subtitle, category, content }
