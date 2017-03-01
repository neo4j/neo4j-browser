import React from 'react'
import { connect } from 'react-redux'
import * as actions from 'shared/modules/settings/settingsDuck'
import {Drawer, DrawerBody, DrawerHeader} from 'nbnmui/drawer'

import styles from './style.css'

const visualSettings =
  [
    {
      maxHistory: {
        displayName: 'Max stream history',
        tooltip: 'Max number of history entries. When reached, old entries gets retired.'
      }
    }
  ]

export const Settings = ({settings, onSettingsSave = () => {}}) => {
  const mappedSettings = visualSettings.map((visualSetting, i) => {
    const setting = Object.keys(visualSetting)[0]
    const visual = visualSetting[setting].displayName
    const tooltip = visualSetting[setting].tooltip
    return (
      <li key={i}>
        <label className={'setting ' + styles.setting}>{visual}</label>
        <input onChange={(event) => {
          settings[setting] = event.target.value
          onSettingsSave(settings)
        }} defaultValue={settings[setting]} title={[tooltip]} />
      </li>
    )
  })

  return (
    <Drawer id='db-settings'>
      <DrawerHeader title='Browser Settings' />
      <DrawerBody>
        {mappedSettings}
      </DrawerBody>
    </Drawer>
  )
}

const mapStateToProps = (state) => {
  return {
    settings: state.settings
  }
}

const mapDispatchToProps = (dispatch) => {
  return {
    onSettingsSave: (settings) => {
      dispatch(actions.update(settings))
    }
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(Settings)
