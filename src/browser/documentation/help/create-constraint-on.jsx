import React from 'react'

const title = 'CREATE CONSTRAINT ON'
const subtitle =
  'Create a property constraint on a node label or relationship type'
const category = 'schemaClauses'
const content = (
  <React.Fragment>
    <p>
      The <code>CREATE CONSTRAINT ON</code> clause will create a property
      constraint on all nodes/relationships that have the specified label/type.
    </p>
    <p>
      The <code>IS UNIQUE</code> property constraint will create an accompanying
      index.
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
            <a help-topic='drop-constraint-on'>:help DROP CONSTRAINT ON</a>{' '}
            <a help-topic='schema'>:help Schema</a>{' '}
            <a help-topic='cypher'>:help Cypher</a>
          </td>
        </tr>
      </tbody>
    </table>
    <section className='example'>
      <figure>
        <pre className='code runnable standalone-example'>
          CREATE CONSTRAINT ON (p:Person) ASSERT p.name IS UNIQUE
        </pre>
        <figcaption>
          Create a unique property constraint on the label Person and property
          name.
        </figcaption>
      </figure>
    </section>
    <section className='example'>
      <figure>
        <pre className='code runnable standalone-example'>
          CREATE CONSTRAINT ON (p:Person) ASSERT exists(p.name)
        </pre>
        <figcaption>
          Create a node property existence constraint on the label Person and
          property name.
        </figcaption>
      </figure>
    </section>
    <section className=' example'>
      <figure>
        <pre className='code runnable standalone-example'>
          CREATE CONSTRAINT ON ()-[l:LIKED]-() ASSERT exists(l.when)
        </pre>
        <figcaption>
          Create a relationship property existence constraint on the type LIKED
          and property when.
        </figcaption>
      </figure>
    </section>
  </React.Fragment>
)

export default { title, subtitle, category, content }
