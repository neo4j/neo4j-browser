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
import { saveAs } from 'file-saver'
import { map } from 'lodash-es'

import { Frame } from 'shared/modules/frames/framesDuck'

import { CSVSerializer } from 'services/serializer'
import { DownloadIcon } from 'browser-components/icons/Icons'
import {
  DropdownButton,
  DropdownContent,
  DropdownItem,
  DropDownItemDivider,
  DropdownList
} from '../Stream/styled'
import {
  downloadPNGFromSVG,
  downloadSVG
} from 'shared/services/exporting/imageUtils'
import {
  stringifyResultArray,
  transformResultRecordsToResultArray,
  recordToJSONMapper
} from 'browser/modules/Stream/CypherFrame/helpers'
import { csvFormat, stringModifier } from 'services/bolt/cypherTypesFormatting'
import arrayHasItems from 'shared/utils/array-has-items'
import { stringifyMod } from 'services/utils'

type ExportButtonProps = {
  frame: Frame
  numRecords: number
  getRecords: () => any
  visElement: any
  isRelateAvailable: boolean
  newProjectFile: (cmd: string) => void
}

function ExportButton({
  isRelateAvailable,
  newProjectFile,
  frame,
  numRecords,
  getRecords,
  visElement
}: ExportButtonProps): JSX.Element {
  function exportCSV(records: any) {
    const exportData = stringifyResultArray(
      csvFormat,
      transformResultRecordsToResultArray(records)
    )
    const data = exportData.slice()
    const csv = CSVSerializer(data.shift())
    csv.appendRows(data)
    const blob = new Blob([csv.output()], {
      type: 'text/plain;charset=utf-8'
    })
    saveAs(blob, 'export.csv')
  }

  function exportTXT() {
    if (frame.type === 'history') {
      const asTxt = frame.result
        //@ts-ignore Frame.result is mistyped and is list of strings on history frames..
        .map((result: string) => {
          const safe = `${result}`.trim()

          if (safe.startsWith(':')) {
            return safe
          }

          return safe.endsWith(';') ? safe : `${safe};`
        })
        .join('\n\n')
      const blob = new Blob([asTxt], {
        type: 'text/plain;charset=utf-8'
      })

      saveAs(blob, 'history.txt')
    }
  }

  function exportJSON(records: any) {
    const exportData = map(records, recordToJSONMapper)
    const data = stringifyMod(exportData, stringModifier, true)
    const blob = new Blob([data], {
      type: 'text/plain;charset=utf-8'
    })
    saveAs(blob, 'records.json')
  }

  function exportPNG() {
    const { svgElement, graphElement, type } = visElement
    downloadPNGFromSVG(svgElement, graphElement, type)
  }

  function exportSVG() {
    const { svgElement, graphElement, type } = visElement
    downloadSVG(svgElement, graphElement, type)
  }

  function exportGrass(data: any) {
    const blob = new Blob([data], {
      type: 'text/plain;charset=utf-8'
    })
    saveAs(blob, 'style.grass')
  }

  const hasData = numRecords > 0
  const canExportTXT = frame.type === 'history' && arrayHasItems(frame.result)
  // Quick reruns of cypher cause buttons to jump
  const canExport =
    canExportTXT ||
    (frame.type === 'cypher' && (hasData || visElement)) ||
    (frame.type === 'style' && hasData)

  return (
    <>
      {canExport && (
        <DropdownButton title="Exports" data-testid="frame-export-dropdown">
          <DownloadIcon />
          {canExport && (
            <DropdownList>
              <DropdownContent>
                {isRelateAvailable && (
                  <>
                    <DropdownItem onClick={() => newProjectFile(frame.cmd)}>
                      Save as project file
                    </DropdownItem>
                    <DropDownItemDivider />
                  </>
                )}
                {hasData && frame.type === 'cypher' && (
                  <>
                    <DropdownItem
                      data-testid="exportCsvButton"
                      onClick={() => exportCSV(getRecords())}
                    >
                      Export CSV
                    </DropdownItem>
                    <DropdownItem onClick={() => exportJSON(getRecords())}>
                      Export JSON
                    </DropdownItem>
                  </>
                )}
                {visElement && (
                  <>
                    <DropdownItem
                      data-testid="exportPngButton"
                      onClick={() => exportPNG()}
                    >
                      Export PNG
                    </DropdownItem>
                    <DropdownItem
                      data-testid="exportSvgButton"
                      onClick={() => exportSVG()}
                    >
                      Export SVG
                    </DropdownItem>
                  </>
                )}
                {canExportTXT && (
                  <DropdownItem
                    data-testid="exportTxtButton"
                    onClick={exportTXT}
                  >
                    Export TXT
                  </DropdownItem>
                )}
                {hasData && frame.type === 'style' && (
                  <DropdownItem
                    data-testid="exportGrassButton"
                    onClick={() => exportGrass(getRecords())}
                  >
                    Export GraSS
                  </DropdownItem>
                )}
              </DropdownContent>
            </DropdownList>
          )}
        </DropdownButton>
      )}
    </>
  )
}

export default ExportButton
