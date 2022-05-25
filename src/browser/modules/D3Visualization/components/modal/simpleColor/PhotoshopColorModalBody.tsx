import { clone } from 'lodash-es'
import * as React from 'react'
import styled from 'styled-components'

import { generateColorsForBase } from 'project-root/src/browser/modules/D3Visualization/components/modal/color/SetupColorPreview'
import PhotoshopColorPicker from 'project-root/src/browser/modules/D3Visualization/components/modal/simpleColor/PhotoshopColorPicker'
import PhotoshopColorPreview from 'project-root/src/browser/modules/D3Visualization/components/modal/simpleColor/PhotoshopColorPreview'
import {
  ApplyButton,
  SimpleButton
} from 'project-root/src/browser/modules/D3Visualization/components/modal/styled'

const Container = styled.div`
  color: black;
`
const InlineBlock = styled.div`
  display: inline-block;
  vertical-align: middle;
`
const ButtonsContainer = styled.div`
  margin: 20px 0;
`
const PreviewText = styled.div<{
  currentColor: IPhotoshopColorModalBodyProps['currentColor']
}>`
  text-align: center;
  background-color: ${({ currentColor }) => currentColor.color};
  color: ${({ currentColor }) => currentColor['text-color-internal']};
  border: 2px solid ${({ currentColor }) => currentColor['border-color']};
  border-radius: 50%;
  padding: 20px;
  margin: 20px;
  display: inline-block;
  vertical-align: middle;
`
interface IColorProps {
  color: string
  'border-color': string
  'text-color-internal': string
}
export interface IPhotoshopColorModalBodyProps {
  currentColor: IColorProps
  onClose: () => void
  onAccept: (colors: IColorProps) => void
}
function PhotoshopColorModalBody({
  onClose,
  onAccept,
  currentColor
}: IPhotoshopColorModalBodyProps) {
  const [colors, setColors] = React.useState<IColorProps>(clone(currentColor))
  const [editor, setEditor] = React.useState({
    color: colors.color,
    updateFn: (color: string) => setColors(generateColorsForBase(color)),
    title: 'initial'
  })
  return (
    <Container>
      <div>
        <PreviewText currentColor={colors}>
          <div>Sample</div>
          <div>text</div>
        </PreviewText>
        <InlineBlock>
          <PhotoshopColorPreview
            color={colors.color}
            title={'Background Color'}
            activeTitle={editor.title}
            updateFn={React.useCallback(color => {
              setColors(x => Object.assign({}, x, { color }))
            }, [])}
            onClick={setEditor}
          />
          <PhotoshopColorPreview
            color={colors['border-color']}
            title={'Border Color'}
            activeTitle={editor.title}
            updateFn={React.useCallback(color => {
              setColors(x => Object.assign({}, x, { 'border-color': color }))
            }, [])}
            onClick={setEditor}
          />
          <PhotoshopColorPreview
            color={colors['text-color-internal']}
            title={'Text Color'}
            activeTitle={editor.title}
            updateFn={React.useCallback(color => {
              setColors(x =>
                Object.assign({}, x, { 'text-color-internal': color })
              )
            }, [])}
            onClick={setEditor}
          />
        </InlineBlock>
      </div>
      <PhotoshopColorPicker
        color={editor.color}
        setColor={React.useCallback(
          color => {
            editor.updateFn(color)
            setEditor(editor => {
              return {
                ...editor,
                color
              }
            })
          },
          [editor.updateFn]
        )}
      />
      <ButtonsContainer>
        <ApplyButton
          onClick={React.useCallback(() => {
            onAccept(colors)
            onClose()
          }, [colors, onAccept, onClose])}
        >
          Apply
        </ApplyButton>
        <SimpleButton onClick={onClose}>Cancel</SimpleButton>
        <SimpleButton
          onClick={React.useCallback(() => {
            setEditor({
              color: colors.color,
              updateFn: (color: string) =>
                setColors(generateColorsForBase(color)),
              title: 'initial'
            })
            setColors(generateColorsForBase(colors.color))
          }, [colors])}
        >
          Generate based on the Background Color
        </SimpleButton>
      </ButtonsContainer>
    </Container>
  )
}

export default PhotoshopColorModalBody
