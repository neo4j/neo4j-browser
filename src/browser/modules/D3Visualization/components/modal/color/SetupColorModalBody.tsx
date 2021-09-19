import * as React from 'react'
import { ISetupColorStorageProps } from './SetupColorStorage'
import styled from 'styled-components'
import { interpolateTurbo } from 'd3-scale-chromatic'
import SetupColorScheme from 'project-root/src/browser/modules/D3Visualization/components/modal/color/SetupColorScheme'
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
const SetupColorModalBody: React.FC<ISetupColorStorageProps> = props => {
  const { properties } = props
  const keys = React.useMemo(
    () => Object.keys(properties).sort((a, b) => (a > b ? 1 : -1)),
    [properties]
  )
  const [isManual, setIsManual] = React.useState(false)
  const handleMappingChange: React.ChangeEventHandler<HTMLInputElement> = React.useCallback(
    event => {
      setIsManual(event.currentTarget.value === 'true')
    },
    []
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
  const colors = React.useMemo(() => {
    const length = values.length - 1
    const isScaled = length < 20
    return values.map((value, i) => {
      return {
        color: colorScheme(isScaled ? (i / length) * 0.8 + 0.1 : i / length),
        value
      }
    })
  }, [values, colorScheme])
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
          <div>
            <Label>
              <InputMarginRight
                type={'radio'}
                name={'map'}
                value={'false'}
                checked={!isManual}
                onChange={handleMappingChange}
              />
              Generate automatically
            </Label>
            <Label>
              <InputMarginRight
                type={'radio'}
                name={'map'}
                value={'true'}
                checked={isManual}
                onChange={handleMappingChange}
              />
              Custom colors
            </Label>
          </div>
          {isManual && (
            <MarginDiv>
              {colors.map(t => (
                <div key={t.value} style={{ backgroundColor: t.color }}>
                  <TextPreview>{t.value}</TextPreview>
                </div>
              ))}
            </MarginDiv>
          )}
        </>
      )}
    </Container>
  )
}

export default SetupColorModalBody
