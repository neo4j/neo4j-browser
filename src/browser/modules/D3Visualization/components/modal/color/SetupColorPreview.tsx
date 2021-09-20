import * as React from 'react'
import { IStyleForLabelProps } from 'project-root/src/browser/modules/D3Visualization/components/GrassEditor'
import styled from 'styled-components'
import GenericModal from 'project-root/src/browser/modules/D3Visualization/components/modal/GenericModal'
import { ColorChangeHandler, SketchPicker } from 'react-color'
import {
  ApplyButton,
  SimpleButton
} from 'project-root/src/browser/modules/D3Visualization/components/modal/styled'
import fontColorContrast from 'font-color-contrast'
import { colord } from 'colord'

interface IProps {
  value: string
  style?: Partial<IStyleForLabelProps>
  onChange: (props: { color: string; value: string }) => void
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
const SketchWrapper = styled.div`
  color: black;
  input {
    color: black;
  }
`
const SetupColorPreview: React.FC<IProps> = ({ value, style, onChange }) => {
  const [open, setOpen] = React.useState(false)
  const doOpen = React.useCallback(() => setOpen(true), [])
  const doClose = React.useCallback(() => setOpen(false), [])

  const handleChange: ColorChangeHandler = React.useCallback(color => {
    setCurrentColor(color.hex)
  }, [])
  const [currentColor, setCurrentColor] = React.useState<string>(
    style?.color ?? 'rgb(0, 0, 0)'
  )
  const genColor = React.useMemo(() => generateColorsForBase(currentColor), [
    currentColor
  ])

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

  if (!style) {
    return null
  }

  return (
    <div>
      <PreviewNode
        backgroundColor={style.color}
        color={style['text-color-internal']}
        borderColor={style['border-color']}
        onClick={doOpen}
      >
        {value}
      </PreviewNode>
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
            <SketchPicker color={currentColor} onChange={handleChange} />
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
    'border-color': colord(color)
      .darken(0.25)
      .toHex(),
    'text-color-internal': fontColorContrast(colord(color).toHex())
  }
}
export default SetupColorPreview
