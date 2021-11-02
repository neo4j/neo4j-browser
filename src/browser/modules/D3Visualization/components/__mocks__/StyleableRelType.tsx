import React from 'react'
import { StylableRelTypeProps } from '../StyleableRelType'

export function StyleableRelType({
  selectedRelType
}: StylableRelTypeProps): JSX.Element {
  return <div>{selectedRelType.relType}</div>
}
