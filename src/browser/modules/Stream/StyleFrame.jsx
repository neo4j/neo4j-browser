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
import { connect } from 'preact-redux'
import FrameTemplate from './FrameTemplate'
import {
  PaddedDiv,
  StyledOneRowStatsBar,
  StyledRightPartial,
  FrameTitlebarButtonSection
} from './styled'
import { FrameButton } from 'browser-components/buttons'
import { objToCss } from 'services/grassUtils'
import { executeSystemCommand } from 'shared/modules/commands/commandsDuck'
import { getCmdChar } from 'shared/modules/settings/settingsDuck'
import { FireExtinguisherIcon } from 'browser-components/icons/Icons'

const StyleStatusbar = ({ onClickCmd, onResetClick }) => {
  return (
    <StyledOneRowStatsBar>
      <StyledRightPartial>
        <FrameTitlebarButtonSection>
          <FrameButton
            data-test-id='styleResetButton'
            onClick={() => onResetClick(onClickCmd)}
          >
            <FireExtinguisherIcon title='Reset style' />
          </FrameButton>
        </FrameTitlebarButtonSection>
      </StyledRightPartial>
    </StyledOneRowStatsBar>
  )
}

const mapStateToProps = state => ({
  onClickCmd: `${getCmdChar(state)}style reset`
})
const mapDispatchToProps = dispatch => ({
  onResetClick: cmd => dispatch(executeSystemCommand(cmd))
})

const Statusbar = connect(mapStateToProps, mapDispatchToProps)(StyleStatusbar)

const StyleFrame = ({ frame }) => {
  let contents = ''
  if (frame.result) {
    contents = objToCss(frame.result)
  }
  return (
    <FrameTemplate
      header={frame}
      numRecords={1}
      getRecords={() => contents}
      contents={
        <PaddedDiv>
          <pre>{contents}</pre>
        </PaddedDiv>
      }
      statusbar={<Statusbar />}
    />
  )
}

export default StyleFrame
