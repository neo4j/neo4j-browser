/*
 * Copyright (c) 2002-2018 "Neo4j, Inc"
 * Network Engine for Objects in Lund AB [http://neotechnology.com]
 *
 * This file is part of Neo4j.
 *
 * Neo4j is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */
/* global btoa */
import React from 'react'
import { connect } from 'react-redux'
import * as actions from 'shared/modules/settings/settingsDuck'
import {
  Drawer,
  DrawerBody,
  DrawerHeader,
  DrawerSection,
  DrawerSectionBody,
  DrawerSubHeader
} from 'browser-components/drawer'
import { RadioSelector, CheckboxSelector } from 'browser-components/Form'
import {
  StyledSetting,
  StyledSettingLabel,
  StyledSettingTextInput
} from './styled'

const visualSettings = [
  {
    title: 'User Interface',
    settings: [
      {
        theme: {
          displayName: 'Theme',
          type: 'radio',
          options: ['normal', 'outline', 'dark']
        }
      },
      {
        editorAutocomplete: {
          displayName: 'Enhanced query editor',
          tooltip: 'Autocomplete and syntax highlighting in query editor',
          type: 'checkbox'
        }
      }
    ]
  },
  {
    title: 'Preferences',
    settings: [
      {
        showSampleScripts: {
          displayName: 'Show sample scripts',
          tooltip: 'Show sample scripts in favorites drawer.',
          type: 'checkbox'
        }
      }
    ]
  },
  {
    title: 'Network Connection',
    settings: [
      {
        useBoltRouting: {
          displayName: 'Use bolt+routing',
          tooltip: 'Use bolt+routing protocol when in a causal cluster.',
          type: 'checkbox'
        }
      }
    ]
  },
  {
    title: 'Result Frames',
    settings: [
      {
        maxFrames: {
          displayName: 'Maximum number of result frames',
          tooltip:
            'Max number of result frames. When reached, old frames gets retired.'
        }
      },
      {
        maxHistory: {
          displayName: 'Max History',
          tooltip:
            'Max number of history entries. When reached, old entries gets retired.'
        }
      },
      {
        scrollToTop: {
          displayName: 'Scroll To Top',
          tooltip: 'Automatically scroll stream to top on new frames.',
          type: 'checkbox'
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
          tooltip:
            'Limit number of nodes displayed on first load of the graph visualization.'
        }
      },
      {
        maxNeighbours: {
          displayName: 'Max Neighbours',
          tooltip: 'Limit exploratory queries to this limit.'
        }
      },
      {
        maxRows: {
          displayName: 'Max Rows',
          tooltip: "Max number of rows to render in 'Rows' result view"
        }
      },
      {
        autoComplete: {
          displayName: 'Connect result nodes',
          tooltip:
            'If this is checked, after a cypher query result is retrieved, a second query is executed to fetch relationships between result nodes.',
          type: 'checkbox'
        }
      }
    ]
  }
]

export const Settings = ({ settings, onSettingsSave = () => {} }) => {
  if (!settings) return null
  const mappedSettings = visualSettings.map((visualSetting, oi) => {
    const title = <DrawerSubHeader>{visualSetting.title}</DrawerSubHeader>
    const mapSettings = visualSetting.settings
      .map((settingObj, i) => {
        const setting = Object.keys(settingObj)[0]
        if (typeof settings[setting] === 'undefined') return false
        const visual = settingObj[setting].displayName
        const tooltip = settingObj[setting].tooltip || ''

        if (!settingObj[setting].type || settingObj[setting].type === 'input') {
          return (
            <StyledSetting key={btoa(visual)}>
              <StyledSettingLabel title={tooltip}>{visual}</StyledSettingLabel>
              <StyledSettingTextInput
                onChange={event => {
                  settings[setting] = event.target.value
                  onSettingsSave(settings)
                }}
                defaultValue={settings[setting]}
                title={[tooltip]}
                className={setting}
              />
            </StyledSetting>
          )
        } else if (settingObj[setting].type === 'radio') {
          return (
            <StyledSetting key={btoa(visual)}>
              <StyledSettingLabel title={tooltip}>{visual}</StyledSettingLabel>
              <RadioSelector
                options={settingObj[setting].options}
                onChange={event => {
                  settings[setting] = event.target.value
                  onSettingsSave(settings)
                }}
                selectedValue={settings[setting]}
              />
            </StyledSetting>
          )
        } else if (settingObj[setting].type === 'checkbox') {
          return (
            <StyledSetting key={btoa(visual)}>
              <CheckboxSelector
                onChange={event => {
                  settings[setting] = event.target.checked
                  onSettingsSave(settings)
                }}
                checked={settings[setting]}
              />
              <StyledSettingLabel title={tooltip}>{visual}</StyledSettingLabel>
            </StyledSetting>
          )
        }
      })
      .filter(setting => setting !== false)
    return (
      <React.Fragment key={btoa(visualSetting.title)}>
        {title}
        {mapSettings}
      </React.Fragment>
    )
  })

  return (
    <Drawer id='db-settings'>
      <DrawerHeader>Browser Settings</DrawerHeader>
      <DrawerBody>
        <DrawerSection>
          <DrawerSectionBody>{mappedSettings}</DrawerSectionBody>
        </DrawerSection>
      </DrawerBody>
    </Drawer>
  )
}

const mapStateToProps = state => {
  return {
    settings: state.settings
  }
}

const mapDispatchToProps = dispatch => {
  return {
    onSettingsSave: settings => {
      dispatch(actions.update(settings))
    }
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(Settings)
