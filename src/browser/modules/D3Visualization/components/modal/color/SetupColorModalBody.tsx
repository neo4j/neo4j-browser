import * as React from 'react'
import { ISetupColorStorageProps } from './SetupColorStorage'
import styled from 'styled-components'
import * as scaleChromatic from 'd3-scale-chromatic'
const Container = styled.div`
  padding: 10px 20px;
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
  const colors = React.useMemo(() => {
    const length = values.length - 1
    return values.map((value, i) => {
      return {
        color: scaleChromatic.interpolateTurbo((i / length) * 0.8 + 0.1),
        value
      }
    })
  }, [values])
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
          <div>
            <Label>
              <InputMarginRight
                type={'radio'}
                name={'map'}
                value={'false'}
                checked={!isManual}
                onChange={handleMappingChange}
              />
              Random
            </Label>
            <Label>
              <InputMarginRight
                type={'radio'}
                name={'map'}
                value={'true'}
                checked={isManual}
                onChange={handleMappingChange}
              />
              Custom
            </Label>
          </div>
          {isManual && (
            <MarginDiv>
              {colors.map(t => (
                <div key={t.value} style={{ backgroundColor: t.color }}>
                  {t.value}
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
