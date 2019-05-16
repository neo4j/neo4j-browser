import React from 'react'

const title = 'Bolt encryption'
const subtitle = 'Certificate handling in web browsers'
const content = (
  <React.Fragment>
    <p>
      Because of how web browsers handle (self signed) certificates the web
      browser needs to go to a HTTPS URL and accept / permanently trust the
      certificate before a secure Bolt connection to the server can be created.
    </p>
    <p>
      By default Neo4j offers a HTTPS URL on{' '}
      <a href='https://localhost:7473'>https://localhost:7473</a>.
    </p>
    <p>
      You will need to manually view (usually by clicking in a broken padlock in
      the address bar) and trust the certificate to be able to create a secure
      connection.
    </p>
    <table className='table-condensed table-help'>
      <tbody>
        {/* <tr>
  <th>Reference:</th>
  <td><code><a href="{{ neo4j.version | neo4jDeveloperDoc }}/drivers/#driver-authentication-encryption">Bolt encryption</a></code> manual section</td>
</tr> */}
        <tr>
          <th>Related:</th>
          <td>
            <a help-topic='bolt'>:help bolt</a>
          </td>
        </tr>
      </tbody>
    </table>
  </React.Fragment>
)

export default { title, subtitle, content }
