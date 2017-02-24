import React from 'react'
import { connect } from 'react-redux'
import * as actions from '../../../shared/modules/settings/settingsDuck'
import ListItem from 'grommet/components/List'
import FormField from 'grommet/components/FormField'
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
      <ListItem key={i}>
        <FormField label={visual} className={'setting ' + styles.setting}>
          <input onChange={(event) => {
            settings[setting] = event.target.value
            onSettingsSave(settings)
          }} defaultValue={settings[setting]} title={[tooltip]} />
        </FormField>
      </ListItem>
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
