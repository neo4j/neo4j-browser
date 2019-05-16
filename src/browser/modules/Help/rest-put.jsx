import React from 'react'

const title = 'REST PUT'
const content = (
  <React.Fragment>
    <p>
      Use <code>:PUT</code> to send HTTP PUT to Neo4j's REST interface.
    </p>
    <table className='table-condensed table-help'>
      <tbody>
        {/* <tr>
        <th>Reference:</th>
        <td><code><a href='{{ neo4j.version | neo4jDeveloperDoc }}/#http-api-index'>REST</a></code></td>
      </tr> */}
        <tr>
          <th>Related:</th>
          <td>
            <a help-topic='rest-get'>:help REST GET</a>
            <a help-topic='rest-post'>:help REST POST</a>
            <a help-topic='rest-delete'>:help REST DELETE</a>
          </td>
        </tr>
      </tbody>
    </table>
    <section className='example'>
      <figure>
        <pre className='code runnable'>{`:PUT /db/data/node/198/properties/foo "Delia"`}</pre>
        <figcaption>Update the name property of node 198.</figcaption>
      </figure>
    </section>
  </React.Fragment>
)

export default { title, content }
