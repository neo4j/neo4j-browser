import { Component } from 'preact'
import { connect } from 'preact-redux'
import { withBus } from 'preact-suber'
import { ThemeProvider } from 'styled-components'
import * as themes from 'browser/styles/themes'
import { getTheme } from 'shared/modules/settings/settingsDuck'
import { FOCUS } from 'shared/modules/editor/editorDuck'

import styles from './style.css'

import Main from '../Main/Main'
import Sidebar from '../Sidebar/Sidebar'
import { toggle } from 'shared/modules/sidebar/sidebarDuck'
import { getActiveConnection, getConnectionState } from 'shared/modules/connections/connectionsDuck'

class BaseLayout extends Component {
  componentDidMount () {
    document.addEventListener('keyup', this.focusEditorOnSlash.bind(this))
  }
  componentWillUnmount () {
    document.removeEventListener('keyup', this.focusEditorOnSlash.bind(this))
  }
  focusEditorOnSlash (e) {
    if (['INPUT', 'TEXTAREA'].indexOf(e.target.tagName) > -1) return
    if (e.key !== '/') return
    this.props.bus && this.props.bus.send(FOCUS)
  }
  render () {
    const {drawer, handleNavClick, activeConnection, connectionState, theme} = this.props
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

export default withBus(connect(mapStateToProps, mapDispatchToProps)(BaseLayout))
