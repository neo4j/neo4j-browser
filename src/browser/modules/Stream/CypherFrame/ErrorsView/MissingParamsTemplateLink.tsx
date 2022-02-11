import React from 'react'

import {
  StyledMissingParamsTemplateLink,
  StyledParamsTemplateClickableArea,
  StyledSpecifyParamsText
} from 'project-root/src/browser/modules/Stream/styled'
import { stringModifier } from 'services/bolt/cypherTypesFormatting'
import { BrowserError } from 'services/exceptions'
import { stringifyMod } from 'services/utils'

type MissingParamsTemplateLinkProps = {
  error: BrowserError
  params: Record<string, unknown>
  onSetFrameCmd: (cmd: string, autoExec: boolean) => void
}
export const MissingParamsTemplateLink = ({
  onSetFrameCmd,
  params,
  error
}: MissingParamsTemplateLinkProps) => {
  const onGenerateMissingParamsTemplate = (
    error: BrowserError,
    params: Record<string, unknown>,
    onSetFrameCmd: (cmd: string, autoExec: boolean) => void
  ): void => {
    const missingParams = getMissingParams(error.message)
    const template = getSettingMissingParamsTemplate(missingParams, params)
    onSetFrameCmd(template, false)
  }

  const getMissingParams = (missingParamsErrorMessage: string) => {
    const regExp = new RegExp(`^Expected parameter\\(s\\): (.*?)$`, 'g')
    const match = regExp.exec(missingParamsErrorMessage)
    if (match && match.length > 1) {
      return match[1].split(', ')
    } else {
      return []
    }
  }
  const getSettingMissingParamsTemplate = (
    missingParams: string[],
    existingParams: Record<string, unknown>
  ): string => {
    const missingParamsTemplate = missingParams
      .map(param => `  "${param}": fill_in_your_value`)
      .join(',\n')

    let existingParamsTemplate = ''
    const existingParamsIsEmpty = Object.keys(existingParams).length === 0
    if (!existingParamsIsEmpty) {
      const existingParamsStringWithBracketsAndSurroundingNewlines =
        stringifyMod(existingParams, stringModifier, true)
      const existingParamsStringCleaned =
        existingParamsStringWithBracketsAndSurroundingNewlines
          .slice(
            1,
            existingParamsStringWithBracketsAndSurroundingNewlines.length - 1
          )
          .trim()
      existingParamsTemplate = `,\n\n  ${existingParamsStringCleaned}`
    }

    return `:params \n{\n${missingParamsTemplate}${existingParamsTemplate}\n}`
  }

  return (
    <StyledMissingParamsTemplateLink>
      <span>Use this template to add missing parameter(s):</span>
      <StyledParamsTemplateClickableArea
        onClick={() =>
          onGenerateMissingParamsTemplate(error, params, onSetFrameCmd)
        }
      >
        :params{'{'}
        <StyledSpecifyParamsText>specify params</StyledSpecifyParamsText>
        {'}'}
      </StyledParamsTemplateClickableArea>
    </StyledMissingParamsTemplateLink>
  )
}
