import { colord } from 'colord'
import fontColorContrast from 'font-color-contrast'
import * as React from 'react'
import styled from 'styled-components'

import {
  IStyleForLabelNodeProps,
  IStyleForLabelProps
} from 'project-root/src/browser/modules/D3Visualization/components/GrassEditor'
import GenericModal from 'project-root/src/browser/modules/D3Visualization/components/modal/GenericModal'
import PhotoshopColorModalBody from 'project-root/src/browser/modules/D3Visualization/components/modal/simpleColor/PhotoshopColorModalBody'

interface IProps {
  value: string
  style: Partial<IStyleForLabelProps>
  onChange: (props: { colors: IStyleForLabelNodeProps; value: string }) => void
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
  const handleLineWidthChange: React.ChangeEventHandler<HTMLInputElement> =
    React.useCallback(
      e => {
        const result = parseInt(e.currentTarget.value)
        setLineWidth(result)
        onLineWidthChange('' + value, `${result}px`)
      },
      [onLineWidthChange, value]
    )
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

      <GenericModal
        isOpen={open}
        onRequestClose={doClose}
        contentLabel={'Pick Color'}
      >
        <PhotoshopColorModalBody
          onClose={doClose}
          currentColor={{
            color: style.color ?? '#000',
            'border-color': style['border-color'] ?? '#000',
            'text-color-internal': style['text-color-internal'] ?? '#000'
          }}
          onAccept={React.useCallback(
            colors => {
              onChange({
                colors,
                value
              })
              doClose()
            },
            [value, doClose, onChange]
          )}
        />
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
