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
  setEditorContent: (cmd: string) => void
  onTemplateHelpMessageClick: () => void
}
export const MissingParamsTemplateLink = ({
  setEditorContent,
  params,
  error,
  onTemplateHelpMessageClick
}: MissingParamsTemplateLinkProps): JSX.Element => {
  const handleTemplateHelpMessageClick = (): void => {
    onTemplateHelpMessageClick()
    const missingParams = getMissingParams(error.message)
    const template = getSettingMissingParamsTemplate(missingParams, params)
    setEditorContent(template)
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
        onClick={() => handleTemplateHelpMessageClick()}
        aria-label={
          'Set editor content with template to be used for setting the missing parameters'
        }
      >
        :params{' {'}
        <StyledSpecifyParamsText>specify params</StyledSpecifyParamsText>
        {'}'}
      </StyledParamsTemplateClickableArea>
    </StyledMissingParamsTemplateLink>
  )
}
