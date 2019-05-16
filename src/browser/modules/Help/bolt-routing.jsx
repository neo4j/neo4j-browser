import React from 'react'

const title = 'bolt+routing in Neo4j Browser'
const subtitle = 'What drivers are used when'
const content = (
  <React.Fragment>
    <p>
      There are two kinds of Bolt drivers specified by URI scheme: the 'bolt://'
      scheme is used to create a <b>direct</b> driver and the 'bolt+routing://'
      scheme is used to create a <b>routing</b> driver. In Neo4j Browser, the
      bolt+routing setting is used to control which driver should be used.
      However it is not always appropriate for Neo4j Browser to use a{' '}
      <b>routing</b> driver even when bolt+routing is on.
    </p>
    <p>
      Neo4j Browser will always:
      <ul className='topic-bullets'>
        <li>
          use a <b>direct</b> driver for user administration frames
        </li>
        <li>
          use a <b>direct</b> driver to populate sysinfo and the member specific
          items in the information panel e.g. version, cluster role etc
        </li>
      </ul>
    </p>
    <p>
      If bolt+routing is on and the provided URI points to a Core Causal Cluster
      member Neo4j Browser will:
    </p>
    <ul className='topic-bullets'>
      <li>
        use a <b>routing</b> driver for all cypher queries submitted via the
        editor (including calls to user administration procedures)
      </li>
      <li>
        use a <b>routing</b> driver to populate the metadata (labels,
        relationship types, properties) in the information panel
      </li>
    </ul>
    <p>
      If bolt+routing is off or the provided URI does not point to a Causal
      Cluster member or the provided URI points to a Read-Replica Causal Cluster
      member, Neo4j Browser will:
    </p>
    <ul className='topic-bullets'>
      <li>
        use a <b>direct</b> driver for all cypher queries submitted via the
        editor
      </li>
      <li>
        use a <b>direct</b> driver to populate the metadata (labels,
        relationship types, properties) in the information panel
      </li>
    </ul>
    <p>
      Please note that in order for bolt+routing to work correctly the current
      user must exist on all members in the cluster with the same authentication
      credentials.
    </p>
    <table className='table-condensed table-help'>
      <tbody>
        {/* <tr>
    <th>Reference:</th>
    <td><code><a href="{{ neo4j.version | neo4jDeveloperDoc }}/drivers/#driver-driver">Bolt drivers</a></code> manual section</td>
  </tr> */}
        <tr>
          <th>Related:</th>
          <td>
            <a help-topic='bolt'>:help bolt</a>{' '}
            <a help-topic='bolt-encryption'>:help bolt encryption</a>
          </td>
        </tr>
      </tbody>
    </table>
  </React.Fragment>
)

export default { title, subtitle, content }
