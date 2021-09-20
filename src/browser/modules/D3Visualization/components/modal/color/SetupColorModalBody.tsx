import * as React from 'react'
import { IColorSettings, ISetupColorStorageProps } from './SetupColorStorage'
import styled from 'styled-components'
import { interpolateTurbo } from 'd3-scale-chromatic'
import SetupColorScheme from 'project-root/src/browser/modules/D3Visualization/components/modal/color/SetupColorScheme'
import { IStyleForLabelProps } from 'project-root/src/browser/modules/D3Visualization/components/GrassEditor'
import { cloneDeep } from 'lodash-es'
import fontColorContrast from 'font-color-contrast'
import SetupColorPreview from 'project-root/src/browser/modules/D3Visualization/components/modal/color/SetupColorPreview'
import { colord } from 'colord'

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
const MarginDiv = styled.div`
  margin: 10px 0;
`
const TextPreview = styled.span`
  ${({ theme }) => theme.primaryText}
`
const SetupColorModalBody: React.FC<ISetupColorStorageProps & {
  colorSettings: IColorSettings
  defaultSettings: IStyleForLabelProps
}> = props => {
  const { properties, colorSettings, defaultSettings } = props
  const keys = React.useMemo(
    () => Object.keys(properties).sort((a, b) => (a > b ? 1 : -1)),
    [properties]
  )
  const [selectedProperty, setSelectedProperty] = React.useState<
    string | undefined
  >(undefined)
  const [currentColorSettings, setCurrentColorSettings] = React.useState<
    IColorSettings
  >(colorSettings ? cloneDeep(colorSettings) : {})
  const handlePropertyChange: React.ChangeEventHandler<HTMLInputElement> = React.useCallback(
    event => {
      setSelectedProperty(event.currentTarget.value)
    },
    []
  )
  const values: string[] = React.useMemo(
    () =>
      selectedProperty
        ? Array.from(properties[selectedProperty]).sort((a, b) =>
            a > b ? 1 : -1
          )
        : [],
    [properties, selectedProperty]
  )
  const [colorScheme, setColorScheme] = React.useState<(t: number) => string>(
    () => interpolateTurbo
  )
  const handleColorSchemeChange = React.useCallback(
    (scheme: (t: number) => string) => {
      setColorScheme(() => scheme)
    },
    []
  )
  React.useEffect(() => {
    const newSettings: IColorSettings = {}
    const length = values.length - 1
    const isScaled = length < 20
    values.forEach((value, i) => {
      const color = colorScheme(
        isScaled ? (i / length) * 0.8 + 0.1 : i / length
      )
      const fontColor = fontColorContrast(
        color.match(/\d+/g)! as [string, string, string]
      )
      const borderColor = colord(color)
        .darken(0.25)
        .toRgbString()
      newSettings[value] = {
        color,
        'border-color': borderColor,
        'text-color-internal': fontColor
      }
    })
    setCurrentColorSettings(newSettings)
  }, [values, colorScheme])
  const handleColorChange = React.useCallback(
    ({ value, color }: { value: string; color: string }) => {
      setCurrentColorSettings(t => {
        const cloned = cloneDeep(t)
        const fontColor = fontColorContrast(
          color.match(/\d+/g)! as [string, string, string]
        )
        const borderColor = colord(color)
          .darken(0.25)
          .toRgbString()
        cloned[value] = {
          color,
          'border-color': borderColor,
          'text-color-internal': fontColor
        }
        return cloned
      })
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
        <>
          <h3>Color map</h3>
          <SetupColorScheme
            selected={colorScheme}
            onChange={handleColorSchemeChange}
          />
          <MarginDiv>
            {values.map(t => (
              <SetupColorPreview
                key={t}
                value={t}
                style={currentColorSettings[t]}
                onChange={handleColorChange}
              />
            ))}
          </MarginDiv>
        </>
      )}
    </Container>
  )
}

export default SetupColorModalBody
