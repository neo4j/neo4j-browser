import { interpolateTurbo } from 'd3-scale-chromatic'
import { cloneDeep } from 'lodash-es'
import * as React from 'react'
import styled from 'styled-components'

import { usePrevious } from 'browser-hooks/hooks'
import SetupColorPreview, {
  generateColorsForBase
} from 'project-root/src/browser/modules/D3Visualization/components/modal/color/SetupColorPreview'
import SetupColorScheme from 'project-root/src/browser/modules/D3Visualization/components/modal/color/SetupColorScheme'
import { IColorSettings } from 'project-root/src/browser/modules/D3Visualization/components/modal/color/SetupColorStorage'
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
  onSubmit: (settings?: IRawColorSettings) => void
  onClose: () => void
}> = ({ values, initialColorSettings, onClose, onSubmit }) => {
  const [currentColorSettings, setCurrentColorSettings] =
    React.useState<IRawColorSettings>(initialColorSettings)
  React.useEffect(() => {
    setCurrentColorSettings(initialColorSettings)
  }, [initialColorSettings])
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
  const [sortVal, setSortVal] = React.useState<'ASC' | 'DESC'>('ASC')
  const sortedValues = React.useMemo(
    () =>
      sortVal === 'ASC'
        ? values.sort((a, b) =>
            a.localeCompare(b, undefined, {
              numeric: true,
              sensitivity: 'base'
            })
          )
        : values.sort((b, a) =>
            a.localeCompare(b, undefined, {
              numeric: true,
              sensitivity: 'base'
            })
          ),
    [values, sortVal]
  )
  const oldColorScheme = usePrevious(colorScheme)
  const oldSort = usePrevious(sortVal)
  React.useEffect(() => {
    setCurrentColorSettings(old => {
      if (
        sortedValues.every(value => old[value] != undefined) &&
        oldColorScheme === colorScheme &&
        oldSort === sortVal
      ) {
        return old
      } else {
        const newSettings: IRawColorSettings = {}
        const length = sortedValues.length - 1
        const isScaled = length < 20
        sortedValues.forEach((value, i) => {
          const color = colorScheme(
            isScaled ? (i / length) * 0.8 + 0.1 : i / length
          )
          newSettings[value] = generateColorsForBase(color)
        })
        return newSettings
      }
    })
  }, [
    sortedValues,
    colorScheme,
    initialColorSettings,
    oldColorScheme,
    sortVal,
    oldSort
  ])

  const handleSubmit = React.useCallback(() => {
    onSubmit(currentColorSettings)
    onClose()
  }, [onSubmit, currentColorSettings, onClose])
  const onReset = React.useCallback(() => {
    onSubmit(undefined)
    onClose()
  }, [onSubmit, onClose])

  return (
    <>
      <h3>Color map</h3>
      <SetupColorScheme
        selected={colorScheme}
        onChange={handleColorSchemeChange}
      />
      <MarginDiv>
        <div>
          <SortButton onClick={React.useCallback(() => setSortVal('ASC'), [])}>
            Ascending
          </SortButton>
          <SortButton onClick={React.useCallback(() => setSortVal('DESC'), [])}>
            Descending
          </SortButton>
        </div>
        {sortedValues.map(t => (
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
        <SimpleButton onClick={onReset}>Reset to default</SimpleButton>
      </div>
    </>
  )
}

const SortButton = styled.button`
  margin-right: 20px;
  background: transparent;
  padding: 5px 2px;
  margin-bottom: 10px;
`
export default SetupColorPicker
