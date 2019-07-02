import React from 'react'

const title = 'EXPLAIN'
const subtitle = 'Explain query execution'
const category = 'executionPlans'
const content = (
  <React.Fragment>
    <p>
      Prefix any query with the <code>EXPLAIN</code> keyword to have Neo4j
      return the execution plan it would use to execute the query. However, the
      query is not executed, and Neo4j will make no changes to the database.
    </p>
    <p>
      See <a help-topic='query plan'>:help QUERY PLAN</a> for a guide to
      understanding the query plan output.
    </p>
    <table className='table-condensed table-help'>
      {/* <tr>
      <th>Reference:</th>
      <td><code><a href='{{ neo4j.version | neo4jDeveloperDoc }}/#execution-plans'>Execution Plans</a></code> manual page</td>
    </tr> */}
      <tr>
        <th>Related:</th>
        <td>
          <a help-topic='profile'>:help PROFILE</a>{' '}
          <a help-topic='query plan'>:help QUERY PLAN</a>{' '}
        </td>
      </tr>
    </table>
    <section className='example'>
      <figure>
        <pre className='code runnable standalone-example'>
          EXPLAIN MATCH (n:Person) RETURN n LIMIT 25
        </pre>
        <figcaption>
          Show the query plan that would be used to find nodes with the Person
          label, without actually executing the plan.
        </figcaption>
      </figure>
    </section>
  </React.Fragment>
)

export default { title, subtitle, category, content }
