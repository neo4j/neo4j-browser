import React from 'react'

const title = 'LOAD CSV'
const subtitle = 'Load data from a CSV file'
const content = (
  <React.Fragment>
    <p>
      The <code>LOAD CSV</code> clause instructs Neo4j to load data from a CSV
      file located at the given URL. This is typically used with{' '}
      <code>CREATE</code> and <code>MERGE</code> to import tabular data into the
      graph. If you are importing a substantially sized data set, you should
      consider using <code>LOAD CSV</code> in combination with{' '}
      <code>USING PERIODIC COMMIT</code>.
    </p>
    <div className='links'>
      <div className='link'>
        <p className='title'>Reference</p>
        <p className='content'>
          <code>
            <a
              target='_blank'
              href='https://neo4j.com/docs/developer-manual/3.2/cypher/clauses/load-csv/'
            >
              LOAD CSV
            </a>{' '}
            manual page
          </code>
          <code>
            <a
              target='_blank'
              href='https://neo4j.com/docs/developer-manual/3.2/cypher/query-tuning/using/#query-using-periodic-commit-hint'
            >
              USING PERIODIC COMMIT
            </a>{' '}
            manual page
          </code>
        </p>
      </div>
      <div className='link'>
        <p className='title'>Related</p>
        <p className='content'>
          <a help-topic='create'>:help CREATE</a>
          <a help-topic='merge'>:help MERGE</a>
          <a help-topic='cypher'>:help Cypher</a>
        </p>
      </div>
    </div>
    <section className='example'>
      <figure className='runnable'>
        <pre>{`LOAD CSV FROM "http://data.neo4j.com/examples/person.csv" AS line
MERGE (n:Person {id: toInteger(line[0])})
SET n.name = line[1]
RETURN n`}</pre>
        <figcaption>
          Import Person nodes from a CSV file into the graph
        </figcaption>
      </figure>
    </section>
  </React.Fragment>
)

export default { title, subtitle, content }
