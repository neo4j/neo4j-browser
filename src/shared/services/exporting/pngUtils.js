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

import { prepareForExport } from './svgUtils'
import FileSaver from 'file-saver'

export const downloadPNGFromSVG = (svg, graph, filename) => {
  let canvas, png, svgData
  const svgObj = prepareForExport(svg, graph)
  svgData = new window.XMLSerializer().serializeToString(svgObj.node())
  svgData = svgData.replace(/&nbsp;/g, '&#160;')
  canvas = document.createElement('canvas')
  canvas.width = svgObj.attr('width')
  canvas.height = svgObj.attr('height')
  window.canvg(canvas, svgData)
  png = canvas.toDataURL('image/png')
  return downloadWithDataURI(filename + '.png', png)
}

const download = (filename, mime, data) => {
  const blob = new Blob([data], {
    type: mime
  })
  return FileSaver.saveAs(blob, filename)
}

const downloadWithDataURI = (filename, dataURI) => {
  var byteString, i, ia, j, mimeString, ref
  byteString = null
  if (dataURI.split(',')[0].indexOf('base64') >= 0) {
    byteString = window.atob(dataURI.split(',')[1])
  } else {
    byteString = unescape(dataURI.split(',')[1])
  }
  mimeString = dataURI.split(',')[0].split(':')[1].split(';')[0]
  ia = new Uint8Array(byteString.length)
  for (i = j = 0, ref = byteString.length; ref >= 0 ? j <= ref : j >= ref; i = ref >= 0 ? ++j : --j) {
    ia[i] = byteString.charCodeAt(i)
  }
  return download(filename, mimeString, ia)
}
