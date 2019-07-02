import React from 'react'

const title = 'Bolt'
const subtitle = 'Using Bolt in Neo4j Browser'
const category = 'boltProtocol'
const content = (
  <React.Fragment>
    <p>
      By default, Neo4j Browser communicates with the database via Bolt using
      the Neo4j JavaScript Driver. However it is possible to turn off Bolt and
      communicate with the database using HTTP(S) as in older versions of Neo4j
      Browser.
    </p>
    <table className='table-condensed table-help'>
      <tbody>
        {/* <tr>
  <th>Reference:</th>
  <td><code><a href="{{ neo4j.version | neo4jDeveloperDoc }}/drivers">Drivers</a></code> manual page,  </td>
</tr> */}
        <tr>
          <th>Related:</th>
          <td>
            <a help-topic='bolt-encryption'>:help bolt encryption</a>{' '}
            <a help-topic='bolt-routing'>:help bolt routing</a>
          </td>
        </tr>
      </tbody>
    </table>
  </React.Fragment>
)

export default { title, subtitle, category, content }
