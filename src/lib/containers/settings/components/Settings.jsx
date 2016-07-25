import React from 'react'
import { connect } from 'react-redux'
import uuid from 'uuid'
import * as actions from '../actions'
import {List, ListItem} from 'material-ui/List'
import RaisedButton from 'material-ui/RaisedButton'
import TextField from 'material-ui/TextField'
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
      <ListItem className={styles.setting} key={uuid.v4()}>
        <label title={tooltip}>{visual}</label>
        <TextField
          id={uuid.v4()}
          defaultValue={settings[setting]}
          onChange={(event) => {
            settings[setting] = event.target.value
          }}
          fullWidth={true}
        />
      </ListItem>
    )
  })

  return (
    <div id='db-settings'>
      <h4>Settings</h4>
      <List>
        {mappedSettings}
      </List>
      <RaisedButton label='Save' onClick={() => onSettingsSave(settings)}/>
    </div>
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
