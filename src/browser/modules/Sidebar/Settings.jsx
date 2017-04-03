import { connect } from 'preact-redux'
import * as actions from 'shared/modules/settings/settingsDuck'
import {Drawer, DrawerBody, DrawerHeader, DrawerSection, DrawerSectionBody, DrawerSubHeader} from 'browser-components/drawer'
import {RadioForm} from 'browser-components/Form'
import { StyledSetting, StyledSettingLabel, StyledSettingTextInput } from './styled'

const visualSettings =
  [
    {
      title: 'User Interface',
      settings: [
        {
          theme: {
            displayName: 'Theme',
            type: 'radio',
            options: ['normal', 'dark', 'outline']
          }
        }
      ]
    },
    {
      title: 'Result Frames',
      settings: [
        {
          maxHistory: {
            displayName: 'Max Neighbors',
            tooltip: 'Max number of history entries. When reached, old entries gets retired.'
          }
        }
      ]
    },
    {
      title: 'Graph Visualization',
      settings: [
        {
          initialNodeDisplay: {
            displayName: 'Initial Node Display',
            tooltip: 'Limit number of nodes displayed on first load of the graph visualization.'
          }
        },
        {
          maxNeighbours: {
            displayName: 'Max Neighbours',
            tooltip: 'Limit exploratary queries to this limit.'
          }
        }
      ]
    }
  ]

export const Settings = ({settings, onSettingsSave = () => {}}) => {
  const mappedSettings = visualSettings.map((visualSetting, i) => {
    const title = <DrawerSubHeader>{visualSetting.title}</DrawerSubHeader>
    const mapSettings = visualSetting.settings.map((settingObj, i) => {
      const setting = Object.keys(settingObj)[0]
      const visual = settingObj[setting].displayName
      const tooltip = settingObj[setting].tooltip || ''

      let value
      if (!settingObj[setting].type || settingObj[setting].type === 'input') {
        value = (<StyledSettingTextInput onChange={(event) => {
          settings[setting] = event.target.value
          onSettingsSave(settings)
        }} defaultValue={settings[setting]} title={[tooltip]} />)
      } else if (settingObj[setting].type === 'radio') {
        value = (<RadioForm options={settingObj[setting].options} onChange={(event) => {
          settings[setting] = event.target.value
          onSettingsSave(settings)
        }} />)
      }
      return (
        <StyledSetting key={i}>
          <StyledSettingLabel>{visual}</StyledSettingLabel>
          {value}
        </StyledSetting>
      )
    })
    return (
      <div>
        {title}
        {mapSettings}
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
