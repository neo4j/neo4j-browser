import React from 'react'

const title = 'Query Status'
const subtitle = 'Show query status.'
const content = (
  <React.Fragment>
    <p>
      The <code>:queries</code> command will list your servers and clusters
      running queries.
      <br />
      From that list you have the ability to kill unwanted queries.
    </p>
  </React.Fragment>
)

export default { title, subtitle, content }
