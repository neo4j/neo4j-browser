import React from 'react'

const title = 'Parameters'
const subtitle = 'View and set parameters to be sent with queries.'
const category = 'cypherQueries'
const content = (
  <React.Fragment>
    <p>
      The <code>:params</code> command will show you a list of all your current
      parameters.
    </p>
    <p>
      Note that setting parameters using this method does not provide type
      safety with numbers.
      <br />
      Instead we advise you to set each param one by one using the{' '}
      <code>:param x => 1</code> syntax.
      <br />
      See <a help-topic='param'>:help param</a> for more info.
    </p>
    <p>
      The <code>:params {`{name: 'Stella', age: 24}`}</code> command will
      replace your current parameters with the new parameters defined in the
      object.
    </p>
    <div className='links'>
      <div className='link'>
        <p className='title'>Related</p>
        <p className='content'>
          <a help-topic='param'>:help param</a>
        </p>
      </div>
    </div>
  </React.Fragment>
)

export default { title, subtitle, category, content }
