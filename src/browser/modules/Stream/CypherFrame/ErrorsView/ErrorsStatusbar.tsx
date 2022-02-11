import React, { Component } from 'react'

import Ellipsis from 'browser-components/Ellipsis'
import { ExclamationTriangleIcon } from 'browser-components/icons/Icons'
import { errorMessageFormater } from 'project-root/src/browser/modules/Stream/errorMessageFormater'
import { ErrorText } from 'project-root/src/browser/modules/Stream/styled'
import { BrowserRequestResult } from 'project-root/src/shared/modules/requests/requestsDuck'
import { BrowserError } from 'services/exceptions'
import { deepEquals } from 'services/utils'

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
