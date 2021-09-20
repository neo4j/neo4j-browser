import * as React from 'react'
import * as scale from 'd3-scale-chromatic'
import styled from 'styled-components'
import GenericModal from '../GenericModal'
type IColorScheme = (t: number) => string

interface IProps {
  selected: IColorScheme
  onChange: (t: IColorScheme) => void
}

const step = 0.01
const BlockDiv = styled.div.attrs((props: { backgroundColor: string }) => ({
  style: {
    backgroundColor: props.backgroundColor
  }
}))<{ backgroundColor: string }>`
  height: 30px;
  display: inline-block;
  vertical-align: middle;
  margin: 3px 0;
  width: 1px;
`
const RadioInput = styled.input`
  vertical-align: middle;
  margin-right: 5px;
`
const InlineDisplay = styled.div.attrs((props: { marginLeft?: string }) => ({
  style: {
    marginLeft: props.marginLeft ?? 0
  }
}))<{ marginLeft?: string }>`
  display: inline-block;
  vertical-align: middle;
  margin-left: 10px;
`
const ItalicDiv = styled.div`
  font-style: italic;
`
const CustomButtonDiv = styled.div`
  cursor: pointer;
`
const ScrollView = styled.div`
  max-height: 70vh;
  overflow-y: auto;
  padding: 0 10px;
`
// eslint-disable-next-line react/display-name
const SetupColorScheme: React.FC<IProps> = React.memo(
  ({ selected, onChange }) => {
    const schemes: IColorScheme[] = React.useMemo(
      () => [
        scale.interpolateBlues,
        scale.interpolateTurbo,
        scale.interpolateCividis,
        scale.interpolateBrBG,
        scale.interpolateGreens,
        scale.interpolateBuGn,
        scale.interpolateBuPu,
        scale.interpolateCool,
        scale.interpolateCubehelixDefault,
        scale.interpolateInferno,
        scale.interpolateGreys,
        scale.interpolatePRGn,
        scale.interpolatePiYG,
        scale.interpolatePuOr,
        scale.interpolateRdBu,
        scale.interpolateRdGy,
        scale.interpolateRdYlBu,
        scale.interpolateRdYlGn,
        scale.interpolateViridis,
        scale.interpolateMagma,
        scale.interpolatePlasma,
        scale.interpolateWarm,
        scale.interpolateRainbow,
        scale.interpolateSinebow,
        scale.interpolateGnBu,
        scale.interpolateOrRd,
        scale.interpolatePuBuGn,
        scale.interpolatePuBu,
        scale.interpolatePuRd,
        scale.interpolateRdPu,
        scale.interpolateYlGnBu,
        scale.interpolateYlGn,
        scale.interpolateYlOrBr,
        scale.interpolateYlOrRd
      ],
      []
    )
    const handleClick: React.MouseEventHandler<HTMLDivElement> = React.useCallback(
      event => {
        const index = event.currentTarget.dataset.index
        if (index) {
          onChange(schemes[parseInt(index, 10)])
        }
        doClose()
      },
      [onChange, schemes]
    )
    const drawBlock = React.useCallback((scheme: IColorScheme) => {
      const nodes: React.ReactNode[] = []
      for (let i = 0; i < 1; i += step) {
        nodes.push(<BlockDiv key={i} backgroundColor={scheme(i)} />)
      }
      return nodes
    }, [])
    const schemeNodes = React.useMemo(
      () =>
        schemes.map((scheme, index) => (
          <CustomButtonDiv
            key={index}
            data-index={index + ''}
            onClick={handleClick}
          >
            <RadioInput
              type={'radio'}
              name={'color-block'}
              checked={selected === scheme}
            />
            {drawBlock(scheme)}
          </CustomButtonDiv>
        )),
      [schemes, handleClick, drawBlock, selected]
    )

    const [open, setOpen] = React.useState(false)
    const doOpen = React.useCallback(() => setOpen(true), [])
    const doClose = React.useCallback(() => setOpen(false), [])

    return (
      <div>
        <div>
          <CustomButtonDiv tabIndex={0} onClick={doOpen}>
            <InlineDisplay>
              <div>Current color scheme:</div>
              <ItalicDiv>(click to change)</ItalicDiv>
            </InlineDisplay>
            <InlineDisplay marginLeft={'10px'}>
              {React.useMemo(() => drawBlock(selected), [drawBlock, selected])}
            </InlineDisplay>
          </CustomButtonDiv>
        </div>
        <GenericModal isOpen={open} onRequestClose={doClose}>
          <ScrollView>
            <h5>Pick a color scheme:</h5>
            {schemeNodes}
          </ScrollView>
        </GenericModal>
      </div>
    )
  }
)

export default SetupColorScheme
