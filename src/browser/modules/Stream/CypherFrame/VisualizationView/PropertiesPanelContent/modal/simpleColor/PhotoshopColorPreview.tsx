import * as React from 'react'
import styled from 'styled-components'

const Container = styled.label`
  margin: 10px 0;
  display: block;
  cursor: pointer;
`
const ColorContainer = styled.div<{ backgroundColor: string }>`
  background-color: ${({ backgroundColor }) => backgroundColor};
  width: 100px;
  height: 20px;
  margin-right: 10px;
  display: inline-block;
  vertical-align: middle;
`
const TitleText = styled.span<{ active: boolean }>`
  ${({ active }) => (active ? `text-decoration: underline;` : '')}
`
interface IPhotoshopColorPreviewPartialProps {
  color: string
  updateFn: (color: string) => void
  title: string
}
function PhotoshopColorPreview({
  color,
  title,
  updateFn,
  onClick,
  activeTitle
}: IPhotoshopColorPreviewPartialProps & {
  activeTitle: string
  onClick: ({ color, updateFn }: IPhotoshopColorPreviewPartialProps) => void
}) {
  return (
    <Container
      onClick={React.useCallback(() => {
        onClick({
          color,
          updateFn,
          title
        })
      }, [onClick, color, updateFn])}
    >
      <ColorContainer backgroundColor={color} />
      <TitleText active={title === activeTitle}>{title}</TitleText>
    </Container>
  )
}

export default PhotoshopColorPreview
