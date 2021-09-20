import * as React from 'react'
import SetupColorModalBody from './SetupColorModalBody'
import {
  IStyleForLabel,
  IStyleForLabelProps
} from 'project-root/src/browser/modules/D3Visualization/components/GrassEditor'
import { cloneDeep } from 'lodash-es'

export interface IColorSettings {
  key: string
  settings: {
    [key: string]: Partial<IStyleForLabelProps>
  }
}

export interface ISetupColorStorageProps {
  properties: {
    [key: string]: string[]
  }
  selector: IStyleForLabel['selector']
  itemStyleProps: IStyleForLabel['props']
  updateStyle: (settings: IColorSettings) => void
  doClose: () => void
}

const SetupColorStorage: React.FC<ISetupColorStorageProps> = props => {
  const { itemStyleProps, updateStyle } = props
  const [colorSettings, setColorSettings] = React.useState<IColorSettings>(
    () => {
      if (
        itemStyleProps.colorSettings &&
        itemStyleProps.colorSettings.key &&
        itemStyleProps.colorSettings.settings
      ) {
        return cloneDeep(itemStyleProps.colorSettings)
      } else {
        return {
          key: '',
          settings: {}
        }
      }
    }
  )
  const [selectedProperty, setSelectedProperty] = React.useState<
    string | undefined
  >(colorSettings.key.length > 0 ? colorSettings.key : undefined)
  const handlePropertyChange: React.ChangeEventHandler<HTMLInputElement> = React.useCallback(
    event => {
      setSelectedProperty(event.currentTarget.value)
    },
    []
  )
  React.useEffect(() => {
    if (selectedProperty) {
      setColorSettings({
        key: selectedProperty,
        settings: {}
      })
    }
  }, [selectedProperty])
  const itemStyle: IStyleForLabelProps = itemStyleProps
  console.log(itemStyleProps, colorSettings)
  return (
    <SetupColorModalBody
      colorSettings={colorSettings}
      defaultSettings={itemStyle}
      onSubmit={updateStyle}
      handlePropertyChange={handlePropertyChange}
      selectedProperty={selectedProperty}
      {...props}
    />
  )
}

export default SetupColorStorage
