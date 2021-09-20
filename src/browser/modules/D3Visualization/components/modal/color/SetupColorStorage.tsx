import * as React from 'react'
import SetupColorModalBody from './SetupColorModalBody'
import {
  IStyleForLabel,
  IStyleForLabelProps
} from 'project-root/src/browser/modules/D3Visualization/components/GrassEditor'
import { cloneDeep } from 'lodash-es'

export interface IColorSettings {
  [key: string]: Partial<IStyleForLabelProps>
}
export interface ISetupColorStorageProps {
  properties: {
    [key: string]: string[]
  }
  selector: IStyleForLabel['selector']
  itemStyleProps: IStyleForLabel['props']
  updateStyle: () => void
}

const SetupColorStorage: React.FC<ISetupColorStorageProps> = props => {
  const { properties, itemStyleProps, selector, updateStyle } = props
  const [colorSettings, setColorSettings] = React.useState<IColorSettings>(
    itemStyleProps.colorSettings ? cloneDeep(itemStyleProps.colorSettings) : {}
  )
  const itemStyle: IStyleForLabelProps = itemStyleProps
  return (
    <SetupColorModalBody
      colorSettings={colorSettings}
      defaultSettings={itemStyle}
      {...props}
    />
  )
}

export default SetupColorStorage
