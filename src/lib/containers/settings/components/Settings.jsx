import React from 'react'
import { connect } from 'react-redux'
import uuid from 'uuid'
import * as actions from '../actions'
import ListItem from 'grommet/components/List'
import Button from 'grommet/components/Button'
import TextInput from 'grommet/components/TextInput'
import {Drawer, DrawerBody, DrawerHeader} from 'nbnmui/drawer'

import styles from './style.css'

const visualSettings =
  [
    {
      cmdchar: {
        displayName: 'Command char',
        tooltip: 'Something'
      }
    },
    {
      maxHistory: {
        displayName: 'Max stream history',
        tooltip: 'Max number of history entries. When reached, old entries gets retired.'
      }
    }
  ]

export const SettingsComponent = ({settings, onSettingsSave = () => {}}) => {
  const mappedSettings = visualSettings.map((visualSetting) => {
    const setting = Object.keys(visualSetting)[0]
    const visual = visualSetting[setting].displayName
    const tooltip = visualSetting[setting].tooltip

    return (
      <ListItem className={styles.setting + ' setting'} key={uuid.v4()}>
        <label title={tooltip}>{visual}</label>
        <TextInput
          id={uuid.v4()}
          defaultValue={settings[setting]}
          onChange={(event) => {
            settings[setting] = event.target.value
          }}
          fullWidth
        />
      </ListItem>
    )
  })

  return (
    <Drawer id='db-settings'>
      <DrawerHeader title='Settings'/>
      <DrawerBody>
        {mappedSettings}
        <Button label='Save' onClick={() => onSettingsSave(settings)}/>
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

const Settings = connect(mapStateToProps, mapDispatchToProps)(SettingsComponent)
export default Settings
