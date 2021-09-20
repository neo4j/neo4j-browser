import * as React from 'react'
import { IColorSettings, ISetupColorStorageProps } from './SetupColorStorage'
import styled from 'styled-components'
import { IStyleForLabelProps } from 'project-root/src/browser/modules/D3Visualization/components/GrassEditor'
import { cloneDeep } from 'lodash-es'
import SetupColorPicker from 'project-root/src/browser/modules/D3Visualization/components/modal/color/SetupColorPicker'

const Container = styled.div`
  padding: 10px 20px;
  max-height: 70vh;
  overflow-y: auto;
`
const InputMarginRight = styled.input`
  margin-right: 5px;
  vertical-align: middle;
`
const Label = styled.label`
  display: block;
  cursor: pointer;
  margin: 5px 0;
  vertical-align: middle;
`
const SetupColorModalBody: React.FC<ISetupColorStorageProps & {
  colorSettings: IColorSettings
  defaultSettings: IStyleForLabelProps
}> = props => {
  const { properties, colorSettings } = props
  const keys = React.useMemo(
    () => Object.keys(properties).sort((a, b) => (a > b ? 1 : -1)),
    [properties]
  )
  const [selectedProperty, setSelectedProperty] = React.useState<
    string | undefined
  >(undefined)
  const handlePropertyChange: React.ChangeEventHandler<HTMLInputElement> = React.useCallback(
    event => {
      setSelectedProperty(event.currentTarget.value)
    },
    []
  )
  return (
    <Container>
      <h3>Color nodes by property values</h3>
      <div>
        {keys.map(key => (
          <Label key={key}>
            <InputMarginRight
              type={'radio'}
              name={'type'}
              value={key}
              onChange={handlePropertyChange}
            />
            {key}
          </Label>
        ))}
      </div>
      {selectedProperty && (
        <SetupColorPicker
          values={properties[selectedProperty]}
          initialColorSettings={colorSettings ? cloneDeep(colorSettings) : {}}
        />
      )}
    </Container>
  )
}

export default SetupColorModalBody
