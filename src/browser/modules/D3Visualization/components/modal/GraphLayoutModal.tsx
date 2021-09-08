import * as React from 'react'
import GenericModal from './GenericModal'
import { IGraphLayoutStats } from '../Graph'
import { ApplyButton, SimpleButton } from './styled'
import styled from 'styled-components'

interface IProps {
  isOpen: boolean
  onClose: () => void
  stats: IGraphLayoutStats
  onDirectionalLayoutClick: () => void
  onDefaultLayoutClick: () => void
}
const MarginDiv = styled.div`
  margin-top: 30px;
`
const GraphLayoutModal: React.FC<IProps> = ({
  isOpen,
  onClose,
  onDirectionalLayoutClick,
  onDefaultLayoutClick
}) => {
  const handleDirectionalClick = React.useCallback(() => {
    onDirectionalLayoutClick()
    onClose()
  }, [onClose, onDirectionalLayoutClick])
  const handleReset = React.useCallback(() => {
    onDefaultLayoutClick()
    onClose()
  }, [onClose, onDefaultLayoutClick])
  return (
    <GenericModal isOpen={isOpen} onRequestClose={onClose}>
      <h2>Graph Layout</h2>
      <SimpleButton onClick={handleDirectionalClick}>
        <DirectionalFlowIcon />
        Directional flow from root node
      </SimpleButton>
      <SimpleButton onClick={handleReset}>
        <DefaultIcon />
        Reset to default
      </SimpleButton>
      {/*<SimpleButton onClick={() => alert('To be done..')} disabled={true}>TBD: Categorized. Group nodes by their type</SimpleButton>*/}
      <MarginDiv>
        <SimpleButton onClick={onClose}>Cancel</SimpleButton>
      </MarginDiv>
    </GenericModal>
  )
}

const SVG = styled.svg`
  display: block;
  margin: 30px auto 20px;
  fill: ${props => props.theme.primaryText}
  stroke: ${props => props.theme.primaryText}
`
const Path = styled.path`
  fill: ${props => props.theme.primaryText};
`

const DefaultIcon = () => (
  <SVG width={100} height={50} viewBox={'0 0 100 50'}>
    <line x1={35} x2={65} y1={40} y2={40} />
    <line x1={50} x2={30} y1={7} y2={40} />
    <line x1={50} x2={70} y1={7} y2={40} />
    <circle cx={50} cy={7} r={5} strokeWidth={2} />
    <circle cx={30} cy={40} r={5} strokeWidth={2} />
    <circle cx={70} cy={40} r={5} strokeWidth={2} />
  </SVG>
)

const DirectionalFlowIcon = () => (
  <SVG width={165} height={30} viewBox={'0 0 110 20'}>
    <line x1={15} x2={45} y1={10} y2={10} />
    <ArrowHead x={45} />
    <line x1={55} x2={85} y1={10} y2={10} />
    <ArrowHead x={85} />
    <circle
      cx={10}
      cy={10}
      r={5}
      fill={'#c05959'}
      stroke={'#f68e8e'}
      strokeWidth={2}
    />
    <circle cx={50} cy={10} r={5} strokeWidth={2} />
    <circle cx={90} cy={10} r={5} strokeWidth={2} />
  </SVG>
)
const ArrowHead: React.FC<{ x: number }> = ({ x }) => (
  <g transform={`translate(${x}, 0)`}>
    <Path
      d={`
    M 0 10
    L -5 13
    L -5 7
    Z
  `}
      stroke={'transparent'}
    />
  </g>
)
export default GraphLayoutModal
