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
`
const MarginDiv = styled.div`
  margin: 10px 0;
`
const SetupColorPreview: React.FC<IProps> = ({ value, style, onChange }) => {
  const [open, setOpen] = React.useState(false)
  const doOpen = React.useCallback(() => setOpen(true), [])
  const doClose = React.useCallback(() => setOpen(false), [])
  const handleSubmit = React.useCallback(() => {
    onChange({
      color: currentColor,
      value
    })
    doClose()
  }, [onChange, value])
  const handleChange: ColorChangeHandler = React.useCallback(color => {
    setCurrentColor(`rgb(${color.rgb.b}, ${color.rgb.g}, ${color.rgb.r})`)
  }, [])
  const [currentColor, setCurrentColor] = React.useState<string>(
    style?.color ?? 'rgb(0, 0, 0)'
  )
  const fontColor = React.useMemo(
    () =>
      fontColorContrast(
        currentColor.match(/\d+/g)! as [string, string, string]
      ),
    [currentColor]
  )
  const borderColor = React.useMemo(
    () =>
      colord(currentColor)
        .darken(0.25)
        .toRgbString(),
    [currentColor]
  )
  React.useEffect(() => {
    setCurrentColor(style?.color ?? '#FFFF')
  }, [style?.color])
  if (!style) {
    return null
  }
  if (value === 'Equatorial Guinea in 2011') {
    console.log(currentColor, style)
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
            color={fontColor}
            borderColor={borderColor}
            onClick={doOpen}
          >
            {value}
          </PreviewNode>
        </MarginDiv>
        <MarginDiv>
          <SketchPicker color={currentColor} onChangeComplete={handleChange} />
        </MarginDiv>
        <div>
          <ApplyButton onClick={handleSubmit}>Apply</ApplyButton>
          <SimpleButton onClick={doClose}>Cancel</SimpleButton>
        </div>
      </GenericModal>
    </div>
  )
}

export default SetupColorPreview
