import * as React from 'react'
import SetupColorScheme from 'project-root/src/browser/modules/D3Visualization/components/modal/color/SetupColorScheme'
import SetupColorPreview, {
  generateColorsForBase
} from 'project-root/src/browser/modules/D3Visualization/components/modal/color/SetupColorPreview'
import styled from 'styled-components'
import { interpolateTurbo } from 'd3-scale-chromatic'
import { IColorSettings } from 'project-root/src/browser/modules/D3Visualization/components/modal/color/SetupColorStorage'
import { cloneDeep } from 'lodash-es'
import {
  ApplyButton,
  SimpleButton
} from 'project-root/src/browser/modules/D3Visualization/components/modal/styled'
const MarginDiv = styled.div`
  margin: 10px 0;
`
type IRawColorSettings = IColorSettings['settings']
const SetupColorPicker: React.FC<{
  values: string[]
  initialColorSettings: IRawColorSettings
  onSubmit: (settings: IRawColorSettings) => void
  onClose: () => void
}> = ({ values, initialColorSettings, onClose, onSubmit }) => {
  const [currentColorSettings, setCurrentColorSettings] = React.useState<
    IRawColorSettings
  >(initialColorSettings)

  const [colorScheme, setColorScheme] = React.useState<(t: number) => string>(
    () => interpolateTurbo
  )
  const handleColorSchemeChange = React.useCallback(
    (scheme: (t: number) => string) => {
      setColorScheme(() => scheme)
    },
    []
  )
  const handleColorChange = React.useCallback(
    ({ value, color }: { value: string; color: string }) => {
      setCurrentColorSettings(t => {
        const cloned = cloneDeep(t)
        cloned[value] = generateColorsForBase(color)
        return cloned
      })
    },
    []
  )
  React.useEffect(() => {
    setCurrentColorSettings(old => {
      if (values.every(value => old[value] != undefined)) {
        return old
      } else {
        const newSettings: IRawColorSettings = {}
        const length = values.length - 1
        const isScaled = length < 20
        values.forEach((value, i) => {
          const color = colorScheme(
            isScaled ? (i / length) * 0.8 + 0.1 : i / length
          )
          newSettings[value] = generateColorsForBase(color)
        })
        return newSettings
      }
    })
  }, [values, colorScheme, initialColorSettings])

  const handleSubmit = React.useCallback(() => {
    onSubmit(currentColorSettings)
    onClose()
  }, [onSubmit, currentColorSettings, onClose])
  return (
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
      <div>
        <ApplyButton onClick={handleSubmit}>Apply</ApplyButton>
        <SimpleButton onClick={onClose}>Cancel</SimpleButton>
      </div>
    </>
  )
}

export default SetupColorPicker
