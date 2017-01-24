import React from 'react'
import { connect } from 'react-redux'

import styles from './style.css'

import Main from '../Main/Main'
import Sidebar from '../Sidebar/Sidebar'

import { callDiscovery } from 'shared/modules/discovery/discoveryDuck'
import { toggle } from '../../../shared/modules/sidebar/sidebarDuck'

class BaseLayout extends React.Component {
  componentDidMount () {
    this.props.discover()
  }
  render () {
    return (
      <div className={styles.wrapper}>
        <div className={styles.app}>
          <div className={styles.body}>
            <Sidebar openDrawer={this.props.drawer} onNavClick={this.props.handleNavClick} />
            <div className={styles.mainContent}>
              <Main />
            </div>
          </div>
        </div>
      </div>
    )
  }
}

const mapStateToProps = (state) => {
  return {
    drawer: state.drawer
  }
}

const mapDispatchToProps = (dispatch) => {
  return {
    handleNavClick: (id) => {
      dispatch(toggle(id))
    },
    discover: () => {
      dispatch(callDiscovery())
    }
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(BaseLayout)
