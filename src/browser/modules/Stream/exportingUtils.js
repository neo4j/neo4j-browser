function exportCSV(records: any) {
  // TODO check for issues in the exported csv, doesn't have headers?
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

function exportTXT(frame: Frame) {
  //TODO RENAME AS export history
  if (frame.type === 'history') {
    const asTxt = frame.result
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
  //TODO remove map/lodash here
  const exportData = map(records, recordToJSONMapper)
  const data = stringifyMod(exportData, stringModifier, true)
  const blob = new Blob([data], {
    type: 'text/plain;charset=utf-8'
  })
  saveAs(blob, 'records.json')
}

function exportPNG(visElement: any) {
  const { svgElement, graphElement, type } = visElement
  downloadPNGFromSVG(svgElement, graphElement, type)
}

function exportSVG(visElement: any) {
  const { svgElement, graphElement, type } = visElement
  downloadSVG(svgElement, graphElement, type)
}

function exportGrass(data: any) {
  const blob = new Blob([data], {
    type: 'text/plain;charset=utf-8'
  })
  saveAs(blob, 'style.grass')
}
