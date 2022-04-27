import { colord } from 'colord'
import fontColorContrast from 'font-color-contrast'
import * as React from 'react'
import { ChangeEventHandler } from 'react'
import { ColorChangeHandler, SketchPicker } from 'react-color'
import styled from 'styled-components'

import { IStyleForLabelProps } from 'project-root/src/browser/modules/D3Visualization/components/GrassEditor'
import GenericModal from 'project-root/src/browser/modules/D3Visualization/components/modal/GenericModal'
import {
  ApplyButton,
  SimpleButton
} from 'project-root/src/browser/modules/D3Visualization/components/modal/styled'

interface IProps {
  value: string
  style?: Partial<IStyleForLabelProps>
  onChange: (props: { color: string; value: string }) => void
  onLineWidthChange: (key: string, value: string) => void
}

interface IPreviewNodeProps {
  borderColor?: string
  backgroundColor?: string
  color?: string
}

const PreviewNode = styled.div.attrs((props: IPreviewNodeProps) => ({
  style: {
    backgroundColor: props.backgroundColor ?? '#FFF',
    color: props.color ?? '#000',
    borderColor: props.borderColor ?? '#FFF'
  }
}))<IPreviewNodeProps>`
  padding-left: 5px;
  border: 2px solid #fff;
  cursor: pointer;
`
const MarginDiv = styled.div`
  margin: 10px 0;
`
export const SketchWrapper = styled.div`
  color: black;
  input {
    color: black;
  }
`
const LineWidthInput = styled.input`
  position: absolute;
  width: 50px;
  right: 2px;
  top: 2px;
  opacity: 0.6;
  color: black;
  &:active,
  &:hover {
    opacity: 1;
  }
`

const RelativeContainer = styled.div`
  position: relative;
`
const SetupColorPreview: React.FC<IProps> = ({
  value,
  style,
  onChange,
  onLineWidthChange
}) => {
  const [open, setOpen] = React.useState(false)
  const doOpen = React.useCallback(() => setOpen(true), [])
  const doClose = React.useCallback(() => setOpen(false), [])

  const handleChange: ColorChangeHandler = React.useCallback(color => {
    setCurrentColor(color.hex)
  }, [])
  const [currentColor, setCurrentColor] = React.useState<string>(
    style?.color ?? 'rgb(0, 0, 0)'
  )
  const genColor = React.useMemo(
    () => generateColorsForBase(currentColor),
    [currentColor]
  )

  React.useEffect(() => {
    setCurrentColor(style?.color ?? '#FFFF')
  }, [style?.color])

  const handleSubmit = React.useCallback(() => {
    onChange({
      color: colord(currentColor).toHex(),
      value
    })
    doClose()
  }, [onChange, value, currentColor])

  const initialLineWidth = React.useMemo(() => {
    if (style && style['shaft-width']) {
      return parseInt(style['shaft-width'])
    } else {
      return undefined
    }
  }, [style])

  const [lineWidth, setLineWidth] = React.useState<number | undefined>(
    initialLineWidth
  )
  React.useEffect(() => {
    setLineWidth(initialLineWidth)
  }, [initialLineWidth])
  const handleLineWidthChange: ChangeEventHandler<HTMLInputElement> =
    React.useCallback(
      e => {
        const result = parseInt(e.currentTarget.value)
        setLineWidth(result)
        onLineWidthChange('' + value, `${result}px`)
      },
      [onLineWidthChange, value]
    )
  if (!style) {
    return null
  }
  return (
    <div>
      <RelativeContainer>
        <PreviewNode
          backgroundColor={style.color}
          color={style['text-color-internal']}
          borderColor={style['border-color']}
          onClick={doOpen}
        >
          {value}
        </PreviewNode>
        {lineWidth != undefined && initialLineWidth != undefined && (
          <LineWidthInput
            type={'number'}
            value={lineWidth}
            onChange={handleLineWidthChange}
          />
        )}
      </RelativeContainer>
      <GenericModal isOpen={open} onRequestClose={doClose}>
        <MarginDiv>
          <PreviewNode
            backgroundColor={currentColor}
            color={genColor['text-color-internal']}
            borderColor={genColor['border-color']}
            onClick={doOpen}
          >
            {value}
          </PreviewNode>
        </MarginDiv>
        <MarginDiv>
          <SketchWrapper>
            <SketchPicker
              disableAlpha={true}
              color={currentColor}
              onChange={handleChange}
            />
          </SketchWrapper>
        </MarginDiv>
        <div>
          <ApplyButton onClick={handleSubmit}>Apply</ApplyButton>
          <SimpleButton onClick={doClose}>Cancel</SimpleButton>
        </div>
      </GenericModal>
    </div>
  )
}

export function generateColorsForBase(
  color: string
): Pick<IStyleForLabelProps, 'color' | 'border-color' | 'text-color-internal'> {
  return {
    color,
    'border-color': colord(color).darken(0.25).toHex(),
    'text-color-internal': fontColorContrast(colord(color).toHex())
  }
}
export default SetupColorPreview
