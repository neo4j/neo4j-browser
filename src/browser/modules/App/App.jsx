import React from 'react'
import { connect } from 'react-redux'

import styles from './style.css'

import Main from '../Main/Main'
import Sidebar from '../Sidebar/Sidebar'
import { toggle } from '../../../shared/modules/sidebar/sidebarDuck'

export const BaseLayout = ({drawer, handleNavClick}) => {
  return (
    <div className={styles.wrapper}>
      <div className={styles.app}>
        <div className={styles.body}>
          <Sidebar openDrawer={drawer} onNavClick={handleNavClick} />
          <div className={styles.mainContent}>
            <Main />
          </div>
        </div>
      </div>
    </div>
  )
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
    }
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(BaseLayout)
