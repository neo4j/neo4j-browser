import React from 'react'

const title = 'DROP CONSTRAINT ON'
const subtitle =
  'Drops a property constraint on a node label or relationship type'
const content = (
  <React.Fragment>
    <p>
      The <code>DROP CONSTRAINT ON</code> clause will delete a property
      constraint
    </p>
    <table className='table-condensed table-help'>
      <tbody>
        {/* <tr>
        <th>Reference:</th>
        <td><code><a href='{{ neo4j.version | neo4jDeveloperDoc }}/cypher/#query-constraints'>schema constraints</a></code> manual page</td>
      </tr> */}
        <tr>
          <th>Related:</th>
          <td>
            <a help-topic='drop-constraint-on'>:help CREATE CONSTRAINT ON</a>{' '}
            <a help-topic='schema'>:help Schema</a>{' '}
            <a help-topic='cypher'>:help Cypher</a>
          </td>
        </tr>
      </tbody>
    </table>
    <section className='example'>
      <figure>
        <pre className='code runnable standalone-example'>
          DROP CONSTRAINT ON (p:Person) ASSERT p.name IS UNIQUE
        </pre>
        <figcaption>
          Drop the unique constraint and index on the label Person and property
          name.
        </figcaption>
      </figure>
    </section>
    <section className='example'>
      <figure>
        <pre className='code runnable standalone-example'>
          DROP CONSTRAINT ON (p:Person) ASSERT exists(p.name)
        </pre>
        <figcaption>
          Drop the node property existence constraint on the label Person and
          property name.
        </figcaption>
      </figure>
    </section>
    <section className='example'>
      <figure>
        <pre className='code runnable standalone-example'>
          DROP CONSTRAINT ON ()-[l:LIKED]-() ASSERT exists(l.when)
        </pre>
        <figcaption>
          Drop the relationship property existence constraint on the type LIKED
          and property when.
        </figcaption>
      </figure>
    </section>
  </React.Fragment>
)

export default { title, subtitle, content }
