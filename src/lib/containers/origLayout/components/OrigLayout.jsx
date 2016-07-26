import React from 'react'
import { connect } from 'react-redux'

import styles from './style.css'

import main from '../../main'
import sidebar from '../../sidebar'

export const BaseLayout = ({drawer, handleNavClick}) => {
  return (
    <div className={styles.wrapper}>
      <div className={styles.app}>
        <div className={styles.body}>
          <sidebar.components.Sidebar openDrawer={drawer} onNavClick={handleNavClick} />
          <div className={styles.mainContent}>
            <main.components.Main />
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
      dispatch(sidebar.actions.toggle(id))
    }
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(BaseLayout)
