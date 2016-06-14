import React from 'react'
import { connect } from 'react-redux'
import uuid from 'uuid'
import * as actions from '../actions'

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
      <li className='setting' key={uuid.v4()}>
        <label title={tooltip}>{visual}</label>
        <input
          defaultValue={settings[setting]}
          onChange={(event) => {
            settings[setting] = event.target.value
          }
        }/>
      </li>
    )
  })

  return (
    <div id='db-settings'>
      <h4>Settings</h4>
      <div>
        <ul>
          {mappedSettings}
        </ul>
        <button onClick={() => onSettingsSave(settings)}>
          Save
        </button>
      </div>
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
