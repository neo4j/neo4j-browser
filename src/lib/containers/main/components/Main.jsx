import React from 'react'
import { connect } from 'react-redux'

import QueryView from '../../../components/QueryView'

export const Main = (props) => {
  return (
    <div id='main'>
      <QueryView {...props} />
    </div>
  )
}

const mapStateToProps = (state) => {
  const context = 'default'
  return {
    context
  }
}

export default connect(mapStateToProps)(Main)
