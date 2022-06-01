import * as React from 'react'
import { SketchPicker } from 'react-color'
import styled from 'styled-components'

const Container = styled.div`
  text-align: center;
`
const Wrapper = styled.div`
  text-align: initial;
  display: inline-block;
`
function PhotoshopColorPicker({
  color,
  setColor
}: {
  color: string
  setColor: (color: string) => void
}) {
  return (
    <Container>
      <Wrapper>
        <SketchPicker
          color={color}
          disableAlpha={true}
          onChange={React.useCallback(
            e => {
              setColor(e.hex)
            },
            [setColor]
          )}
        />
      </Wrapper>
    </Container>
  )
}

export default PhotoshopColorPicker
