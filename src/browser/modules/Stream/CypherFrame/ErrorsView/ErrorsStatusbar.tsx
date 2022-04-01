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
import React, { Component } from 'react'

import { deepEquals } from 'neo4j-arc/common'
import { ExclamationTriangleIcon } from 'browser-components/icons/LegacyIcons'

import Ellipsis from 'browser-components/Ellipsis'
import { errorMessageFormater } from 'project-root/src/browser/modules/Stream/errorMessageFormater'
import { ErrorText } from 'project-root/src/browser/modules/Stream/styled'
import { BrowserRequestResult } from 'project-root/src/shared/modules/requests/requestsDuck'
import { BrowserError } from 'services/exceptions'

type ErrorsStatusBarProps = {
  result: BrowserRequestResult
}
export class ErrorsStatusbar extends Component<ErrorsStatusBarProps> {
  shouldComponentUpdate(props: ErrorsStatusBarProps): boolean {
    return !deepEquals(props.result, this.props.result)
  }

  render(): null | JSX.Element {
    const error = this.props.result as BrowserError
    if (!error || (!error.code && !error.message)) return null
    const fullError = errorMessageFormater(error.code, error.message)

    return (
      <Ellipsis>
        <ErrorText title={fullError.title}>
          <ExclamationTriangleIcon /> {fullError.message}
        </ErrorText>
      </Ellipsis>
    )
  }
}
