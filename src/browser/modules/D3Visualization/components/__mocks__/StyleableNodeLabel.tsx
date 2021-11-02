import React from 'react'
import { StyleableNodeLabelProps } from '../StyleableNodeLabel'

export function StyleableNodeLabel({
  selectedLabel
}: StyleableNodeLabelProps): JSX.Element {
  return <div>{selectedLabel.label}</div>
}
