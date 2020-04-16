/*
 * Copyright (c) 2002-2020 "Neo4j,"
 * Neo4j Sweden AB [http://neo4j.com]
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
import React, { useState } from 'react'
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
  StyledSettingTextInput,
  StyledSettingTextArea,
  StyledSettingButton
} from './styled'
import { toKeyString } from 'services/utils'
import {
  getExperimentalFeatures,
  experimentalFeatureSelfName,
  enableExperimentalFeature,
  disableExperimentalFeature
} from 'shared/modules/experimentalFeatures/experimentalFeaturesDuck'
import FeatureToggle from 'browser/modules/FeatureToggle/FeatureToggle'
import { executeSystemCommand } from 'shared/modules/commands/commandsDuck'
import { objToCss, parseGrass } from 'services/grassUtils'

const visualSettings = [
  {
    title: 'GraSS',
    settings: [
      {
        grass: {
          displayName: 'GraSS Editor',
          tooltip: 'Edit Stylesheet here',
          type: 'input'
        }
      }
    ]
  }
]

export const GraphStyling = ({
  grass,
  visualSettings,
  onSettingsSave = () => {}
}) => {
  const [grassValue, setGrassValue] = useState(grass)
  if (!grass) return 'No GraSS yet...'

  const mappedSettings = visualSettings.map(visualSetting => {
    const title = <DrawerSubHeader>{visualSetting.title}</DrawerSubHeader>
    const mapSettings = visualSetting.settings
      .map(settingObj => {
        const setting = Object.keys(settingObj)[0]
        const visual = settingObj[setting].displayName
        const tooltip = settingObj[setting].tooltip || ''

        if (!settingObj[setting].type || settingObj[setting].type === 'input') {
          return (
            <StyledSetting key={toKeyString(visual)}>
              <StyledSettingLabel title={tooltip}>{visual}</StyledSettingLabel>
              <StyledSettingTextArea
                defaultValue={objToCss(grassValue)}
                className={setting}
                title={[tooltip]}
                onChange={e => setGrassValue(parseGrass(e.target.value))}
              />
              <StyledSettingButton onClick={() => onSettingsSave(grassValue)}>
                Save
              </StyledSettingButton>
            </StyledSetting>
          )
        }
      })
      .filter(setting => setting !== false)
    return (
      <React.Fragment key={toKeyString(visualSetting.title)}>
        {title}
        {mapSettings}
      </React.Fragment>
    )
  })

  return (
    <Drawer id="db-grass">
      <DrawerHeader>GraSS</DrawerHeader>
      <DrawerBody>
        <DrawerSection>
          <DrawerSectionBody key="settings">{mappedSettings}</DrawerSectionBody>
        </DrawerSection>
      </DrawerBody>
    </Drawer>
  )
}

const mapStateToProps = state => {
  return {
    grass: state.grass,
    visualSettings
  }
}

const mapDispatchToProps = dispatch => {
  return {
    onSettingsSave: grass => {
      // can only get the command to work by stripping out all spaces and new lines
      const grassVal = objToCss(grass).replace(/ |\n/g, '')
      dispatch(executeSystemCommand(`:style ${grassVal})}`))
    }
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(GraphStyling)
