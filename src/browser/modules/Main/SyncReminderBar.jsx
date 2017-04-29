import { Component } from 'preact'
import { connect } from 'preact-redux'
import { SyncDisconnectedBanner, SyncSignInBarButton } from './styled'
import { CONNECTED_STATE, getConnectionState } from 'shared/modules/connections/connectionsDuck'
import Visible from 'browser-components/Visible'
import BrowserSyncAuthWindow from '../Sync/BrowserSyncAuthWindow'
import { getBrowserSyncConfig } from 'shared/modules/settings/settingsDuck'
import { SyncManager } from 'services/browserSyncService'
import { setSync } from 'shared/modules/sync/syncDuck'

class SyncReminderBar extends Component {
  componentWillMount () {
    this.syncManager = new SyncManager({
      dbConfig: this.props.browserSyncConfig.firebaseConfig,
      serviceReadyCallback: this.serviceReady.bind(this),
      onSyncCallback: this.props.onSync
    })
  }
  serviceReady (status) {
    this.setState({status})
  }
  logIn () {
    BrowserSyncAuthWindow(this.props.browserSyncConfig.authWindowUrl, this.syncManager.authCallBack.bind(this.syncManager))
  }
  render () {
    const { dbConnectionState, syncConsent, sync } = this.props
    const dbConnected = dbConnectionState === CONNECTED_STATE
    const syncDisconnected = !sync || !sync.authData
    const syncConsentGiven = syncConsent && syncConsent.consented === true

    const visible = dbConnected && syncDisconnected && syncConsentGiven && this.state.status === 'UP'

    return (
      <Visible if={visible}>
        <SyncDisconnectedBanner height='100px'>
          You are currently <span style={{'font-size': '110%', 'font-weight': 'bold'}}>not</span> signed into Neo4j Browser Sync. Connect through a simple social sign-in to get started.
          <SyncSignInBarButton onClick={this.logIn.bind(this)}>Sign In</SyncSignInBarButton>
          Cancel
        </SyncDisconnectedBanner>
      </Visible>
    )
  }
}

const mapStateToProps = (state) => {
  return {
    syncConsent: state.syncConsent,
    sync: state.sync,
    dbConnectionState: getConnectionState(state),
    browserSyncConfig: getBrowserSyncConfig(state)
  }
}

const mapDispatchToProps = (dispatch, ownProps) => {
  return {
    onSync: (syncObject) => {
      dispatch(setSync(syncObject))
    }
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(SyncReminderBar)
