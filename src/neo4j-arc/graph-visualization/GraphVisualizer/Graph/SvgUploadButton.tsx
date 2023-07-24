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
 *
 * This component was written by petra.schanz@deutschebahn.com
 */
import React, { ChangeEvent, useState } from 'react'

import { RightArrowIcon } from '../../../../../src/browser/components/icons/LegacyIcons'

import { createPortal } from 'react-dom'
import { NodeModel } from '../../models/Node'

function SvgUploadButton(props: any): JSX.Element {
  const [showDialog, setShowDialog] = useState(false)

  const togglePopup = () => {
    setShowDialog(!showDialog)
  }

  function extractSvgGElements(svgString: string) {
    if (
      !svgString ||
      !svgString.startsWith('<svg') ||
      !svgString.endsWith('</svg>') ||
      svgString.indexOf('<style') > -1 ||
      svgString.indexOf('<script') > -1
    ) {
      alert('Sorry, this is not a valid neo4j-svg file')
      return []
    }
    const svgFragment = document.createDocumentFragment()
    const svgContainer = document.createElement('div')
    svgContainer.innerHTML = svgString
    svgFragment.appendChild(svgContainer)
    const gElements = svgFragment.querySelector('g.layer.nodes')?.children
    return gElements
  }

  function extractSvgGElementAttributes(gElement: SVGGElement) {
    const classes = gElement
      ?.getAttribute('class')
      ?.split(' ')
      .filter((cl: string) => cl.startsWith('uuid_'))
    const uuid = classes && classes.length ? classes[0].split('_')[1] : ''
    const nodeId = gElement?.getAttribute('aria-label')?.split('graph-node')[1]
    const transform = gElement
      ?.getAttribute('transform')
      ?.split('(')[1]
      ?.split(',')
    return { uuid, nodeId, transform }
  }

  const changeHandler: any = (event: ChangeEvent) => {
    const reader = new FileReader()

    reader.onload = async event => {
      const gElements = extractSvgGElements(
        event?.target?.result ? (event.target.result as string) : ''
      )
      const graphModel = props.visualization.getGraph()

      if (!gElements) {
        alert('Sorry, this is not a valid neo4j-svg-File')
        return
      }

      Array.prototype.forEach.call(gElements, (gElement: SVGGElement): void => {
        const { uuid, nodeId, transform } =
          extractSvgGElementAttributes(gElement)

        if (!nodeId || !transform) {
          return
        }

        const myNode = uuid
          ? graphModel.findNodeByUuid(uuid)
          : graphModel.findNode(nodeId)

        if (!myNode) {
          return
        }

        myNode.moveNodePosition(
          parseFloat(transform[0]),
          parseFloat(transform[1].split(')')[0])
        )
        graphModel.updateNode(myNode)
      })
      props.visualization.updateNodePositions()
    }
    reader.readAsText((event?.target as any)?.files[0])
  }

  return (
    <>
      <button title="Upload node positions" onClick={() => togglePopup()}>
        <RightArrowIcon />
      </button>
      {createPortal(
        <div
          id="uploadDialogContainer"
          onClick={() => togglePopup()}
          style={{
            position: 'absolute',
            width: showDialog ? '100vw' : '0',
            height: '100vh',
            backgroundColor: 'rgba(0,0,0,0.5)',
            left: '0',
            top: '0',
            zIndex: 10
          }}
        >
          <dialog
            open={showDialog}
            style={{
              padding: '10px',
              borderRadius: '5px',
              top: '30vh',
              margin: '0 auto'
            }}
          >
            <form>
              <p>Upload a formerly exported svg here.</p>
              <p>
                All known nodes will be dragged to the position marked in the
                svg
              </p>
              <br />
              <input
                type="file"
                id="upload_file_input"
                accept=".svg"
                onChange={event => changeHandler(event)}
              />
            </form>
          </dialog>
        </div>,
        document.body
      )}
    </>
  )
}

export default SvgUploadButton
