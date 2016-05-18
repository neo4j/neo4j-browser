import { connect } from 'react-redux'
import DatabaseInfo from './DatabaseInfo'
import editor from '../../editor'

const mapStateToProps = (state) => {
  return state.meta
}

const mapDispatchToProps = (dispatch) => {
  return {
    onItemClick: (cmd) => {
      dispatch(editor.actions.setContent(cmd))
    }
  }
}

export const DatabaseDrawer = connect(mapStateToProps, mapDispatchToProps)(DatabaseInfo)

