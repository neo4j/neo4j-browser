import React from 'react'

const title = 'REST GET'
const category = 'restApiCommands'
const content = (
  <React.Fragment>
    <p>
      Use <code>:GET</code> to send HTTP GET to Neo4j's REST interface.
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
            <a help-topic='rest-delete'>:help REST DELETE</a>
            <a help-topic='rest-post'>:help REST POST</a>
            <a help-topic='rest-put'>:help REST PUT</a>
          </td>
        </tr>
      </tbody>
    </table>
    <section className='example'>
      <figure>
        <pre className='code runnable'>:GET /db/data/labels</pre>
        <figcaption>Get the available labels</figcaption>
      </figure>
    </section>
  </React.Fragment>
)

export default { title, category, content }
