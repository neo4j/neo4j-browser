import { connect } from 'preact-redux'
import * as actions from 'shared/modules/settings/settingsDuck'
import {Drawer, DrawerBody, DrawerHeader, DrawerSection, DrawerSectionBody} from 'browser-components/drawer'
import { StyledSettingLabel, StyledSettingTextInput } from './styled'

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
      <div key={i}>
        <StyledSettingLabel>{visual}</StyledSettingLabel>
        <StyledSettingTextInput onChange={(event) => {
          settings[setting] = event.target.value
          onSettingsSave(settings)
        }} defaultValue={settings[setting]} title={[tooltip]} />
      </div>
    )
  })

  return (
    <Drawer id='db-settings'>
      <DrawerHeader>Browser Settings</DrawerHeader>
      <DrawerBody>
        <DrawerSection>
          <DrawerSectionBody>
            {mappedSettings}
          </DrawerSectionBody>
        </DrawerSection>
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
