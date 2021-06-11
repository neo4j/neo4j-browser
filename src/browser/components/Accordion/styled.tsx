import styled from 'styled-components'

export const BorderedWrapper = styled.div`
  border-left: 1px solid rgba(34, 36, 38, 0.15);
  border-right: 1px solid rgba(34, 36, 38, 0.15);
  border-bottom: 1px solid rgba(34, 36, 38, 0.15);
`

export const TitleBar = styled.div`
  border-top: 1px solid rgba(34, 36, 38, 0.15);
  height: 39px;
  display: flex;
  cursor: pointer;
`

export const ContentArea = styled.div`
  background-color: ${props => props.theme.accordionContentBackground};
  min-height: 50px;
`
