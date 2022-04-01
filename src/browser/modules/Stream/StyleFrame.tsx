/*
 * Copyright (c) "Neo4j"
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
import React, { useEffect } from 'react'
import { connect } from 'react-redux'

import { FireExtinguisherIcon } from 'browser-components/icons/LegacyIcons'

import FrameBodyTemplate from '../Frame/FrameBodyTemplate'
import { InfoView } from './InfoView'
import { PaddedDiv, StyledOneRowStatsBar, StyledRightPartial } from './styled'
import { FrameButton } from 'browser-components/buttons'
import { StyledFrameTitlebarButtonSection } from 'browser/modules/Frame/styled'
import { objToCss } from 'services/grassUtils'
import {
  commandSources,
  executeCommand,
  executeSystemCommand
} from 'shared/modules/commands/commandsDuck'

const StyleFrame = ({
  frame,
  isCollapsed,
  isFullscreen,
  setExportItems
}: any) => {
  let grass: string | false = ''
  let contents = (
    <InfoView
      title="No styles yet"
      description="No style generated or set yet. Run a query and return a few nodes and
    relationships to generate some styling."
    />
  )
  if (frame.result) {
    grass = objToCss(frame.result)
    contents = (
      <PaddedDiv>
        <pre>
          {grass ||
            'Something went wrong when parsing the GraSS. Please reset and try again.'}
        </pre>
      </PaddedDiv>
    )
  }

  useEffect(() => {
    setExportItems([
      {
        name: 'GraSS',
        download: () => {
          const blob = new Blob([grass || ''], {
            type: 'text/plain;charset=utf-8'
          })
          saveAs(blob, 'style.grass')
        }
      }
    ])
    return () => setExportItems([])
  }, [setExportItems, grass])

  return (
    <FrameBodyTemplate
      isCollapsed={isCollapsed}
      isFullscreen={isFullscreen}
      contents={contents}
      statusBar={<Statusbar frame={frame} />}
    />
  )
}

const StyleStatusbar = ({
  resetStyleAction,
  rerunAction,
  onResetClick
}: any) => {
  return (
    <StyledOneRowStatsBar>
      <StyledRightPartial>
        <StyledFrameTitlebarButtonSection>
          <FrameButton
            title="Reset style"
            dataTestId="styleResetButton"
            onClick={() => onResetClick(resetStyleAction, rerunAction)}
          >
            <FireExtinguisherIcon title="Reset style" />
          </FrameButton>
        </StyledFrameTitlebarButtonSection>
      </StyledRightPartial>
    </StyledOneRowStatsBar>
  )
}

const mapStateToProps = (_state: any, ownProps: any) => {
  return {
    resetStyleAction: executeSystemCommand(':style reset'),
    rerunAction: executeCommand(ownProps.frame.cmd, {
      id: ownProps.frame.id,
      source: commandSources.button
    })
  }
}
const mapDispatchToProps = (dispatch: any) => ({
  onResetClick: (resetStyleAction: any, rerunAction: any) => {
    dispatch(resetStyleAction)
    dispatch(rerunAction)
  }
})

const Statusbar = connect(mapStateToProps, mapDispatchToProps)(StyleStatusbar)

export default StyleFrame
