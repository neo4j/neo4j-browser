import { connect } from 'react-redux'
import DatabaseInfo from './DatabaseInfo'

const mapStateToProps = (state) => {
  return {
    labels: state.labels
  }
}

export const DatabaseDrawer = connect(mapStateToProps, null)(DatabaseInfo)

