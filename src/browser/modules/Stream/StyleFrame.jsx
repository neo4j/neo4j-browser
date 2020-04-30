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
import FrameTemplate from '../Frame/FrameTemplate'
import { PaddedDiv, StyledOneRowStatsBar, StyledRightPartial } from './styled'
import { StyledFrameTitlebarButtonSection } from 'browser/modules/Frame/styled'
import { FrameButton } from 'browser-components/buttons'
import { objToCss } from 'services/grassUtils'
import {
  executeSystemCommand,
  executeCommand
} from 'shared/modules/commands/commandsDuck'
import { getCmdChar } from 'shared/modules/settings/settingsDuck'
import { FireExtinguisherIcon } from 'browser-components/icons/Icons'
import { InfoView } from './InfoView'
import FeatureToggle from 'browser/modules/FeatureToggle/FeatureToggle'
import { setEditMode } from 'shared/modules/stream/streamDuck'

const StyleFrame = ({ frame }) => {
  const [grass, setGrass] = useState(frame.result ? objToCss(frame.result) : '')

  let contents = (
    <InfoView
      title="No styles yet"
      description="No style generated or set yet. Run a query and return a few nodes and
    relationships to generate some styling."
    />
  )
  if (!frame.edit && frame.result) {
    contents = (
      <PaddedDiv>
        <pre>
          {grass ||
            'Something went wrong when parsing the GraSS. Please reset and try again.'}
        </pre>
      </PaddedDiv>
    )
  }
  if (frame.edit && frame.result) {
    contents = grass
  }

  return (
    <FrameTemplate
      edit={frame.edit}
      id={frame.id}
      header={frame}
      numRecords={1}
      getRecords={() => grass}
      updateGrassValue={value => setGrass(value)}
      contents={contents}
      statusbar={<Statusbar frame={frame} grass={grass} />}
    />
  )
}

const StyleStatusbar = ({
  resetStyleAction,
  rerunAction,
  onResetClick,
  setGrassEditMode,
  setEditModeAction,
  isInEditMode,
  updateGrass,
  updateGrassAction
}) => {
  return (
    <StyledOneRowStatsBar>
      <StyledRightPartial>
        <StyledFrameTitlebarButtonSection>
          <FeatureToggle
            name={'grass-edit'}
            on={
              <React.Fragment>
                <FrameButton
                  // data-testid="styleResetButton"
                  onClick={() => {
                    return isInEditMode
                      ? updateGrass(updateGrassAction)
                      : setGrassEditMode(setEditModeAction)
                  }}
                >
                  {isInEditMode ? 'Save' : 'Edit'}
                </FrameButton>
                <FrameButton
                  data-testid="styleResetButton"
                  onClick={() => onResetClick(resetStyleAction, rerunAction)}
                >
                  <FireExtinguisherIcon title="Reset style" />
                </FrameButton>
              </React.Fragment>
            }
            off={
              <FrameButton
                data-testid="styleResetButton"
                onClick={() => onResetClick(resetStyleAction, rerunAction)}
              >
                <FireExtinguisherIcon title="Reset style" />
              </FrameButton>
            }
          />
        </StyledFrameTitlebarButtonSection>
      </StyledRightPartial>
    </StyledOneRowStatsBar>
  )
}

const mapStateToProps = (state, ownProps) => {
  return {
    resetStyleAction: executeSystemCommand(`${getCmdChar(state)}style reset`),
    rerunAction: executeCommand(ownProps.frame.cmd, {
      id: ownProps.frame.id
    }),
    setEditModeAction: setEditMode(ownProps.frame.id),
    isInEditMode:
      (state.frames.byId[ownProps.frame.id].stack[0].hasOwnProperty('edit') &&
        state.frames.byId[ownProps.frame.id].stack[0].edit === true) ||
      false,
    updateGrassAction: executeSystemCommand(
      `:style ${ownProps.grass.replace(/ |\n/g, '')}`
    )
  }
}
const mapDispatchToProps = dispatch => ({
  onResetClick: (resetStyleAction, rerunAction) => {
    dispatch(resetStyleAction)
    dispatch(rerunAction)
  },
  setGrassEditMode: setEditModeAction => {
    dispatch(setEditModeAction)
  },
  updateGrass: updateGrassAction => {
    dispatch(updateGrassAction)
  }
})

const Statusbar = connect(mapStateToProps, mapDispatchToProps)(StyleStatusbar)

export default StyleFrame
