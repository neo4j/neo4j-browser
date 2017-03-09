import { connect } from 'react-redux'
import { ThemeProvider } from 'styled-components'
import * as themes from 'browser/styles/themes'
import { getTheme } from 'shared/modules/settings/settingsDuck'

import styles from './style.css'

import Main from '../Main/Main'
import Sidebar from '../Sidebar/Sidebar'
import { toggle } from 'shared/modules/sidebar/sidebarDuck'
import { getConnectionState } from 'shared/modules/connections/connectionsDuck'

const BaseLayout = ({drawer, handleNavClick, activeConnection, connectionState, theme}) => {
  const themeData = themes[theme] || themes['normal']
  return (
    <ThemeProvider theme={themeData}>
      <div className={styles.wrapper}>
        <div className={styles.app}>
          <div className={styles.body}>
            <Sidebar activeConnection={activeConnection} openDrawer={drawer} onNavClick={handleNavClick} connectionState={connectionState} />
            <div className={styles.mainContent}>
              <Main />
            </div>
          </div>
        </div>
      </div>
    </ThemeProvider>
  )
}

const mapStateToProps = (state) => {
  return {
    drawer: state.drawer,
    activeConnection: getActiveConnection(state),
    theme: getTheme(state),
    connectionState: getConnectionState(state)
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
