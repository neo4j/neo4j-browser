/*
 * Copyright (c) 2002-2017 "Neo Technology,"
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

import { DISCONNECTED_STATE, PENDING_STATE } from 'shared/modules/connections/connectionsDuck'
import Editor from '../Editor/Editor'
import Stream from '../Stream/Stream'
import Visible from 'browser-components/Visible'
import ClickToCode from '../ClickToCode'
import { StyledMain, WarningBanner, ErrorBanner, NotAuthedBanner, StyledCodeBlockAuthBar, StyledCodeBlockErrorBar } from './styled'
import SyncReminderBanner from './SyncReminderBanner'

const Main = (props) => {
  return (
    <StyledMain>
      <Editor />
      <Visible if={props.showUnknownCommandBanner}>
        <ErrorBanner>
          Type&nbsp;
          <ClickToCode CodeComponent={StyledCodeBlockErrorBar}>
            {props.cmdchar}help commands
          </ClickToCode>&nbsp;
          for a list of available commands.
        </ErrorBanner>
      </Visible>
      <Visible if={props.errorMessage}>
        <ErrorBanner>
          {props.errorMessage}
        </ErrorBanner>
      </Visible>
      <Visible if={props.connectionState === DISCONNECTED_STATE}>
        <NotAuthedBanner>
          Database access not available. Please use&nbsp;
          <ClickToCode CodeComponent={StyledCodeBlockAuthBar}>
            {props.cmdchar}server connect
          </ClickToCode>&nbsp;
          to establish connection. There's a graph waiting for you.
        </NotAuthedBanner>
      </Visible>
      <Visible if={props.connectionState === PENDING_STATE}>
        <WarningBanner>
          Connection to server lost. Reconnecting...
        </WarningBanner>
      </Visible>
      <SyncReminderBanner />
      <Stream />
    </StyledMain>
  )
}

export default Main
