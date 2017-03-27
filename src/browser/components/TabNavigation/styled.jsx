import styled, { keyframes } from 'styled-components'

const pushRight = keyframes`
  from {
    transform: translate(0, 0);
    width: 0px;
  }
  to {
    opacity: 1;
  }
`

export const StyledDrawer = styled.div`
  flex: 0 0 300px;
  width: 300px;
  background-color: #30333A;
  overflow: auto;
  animation: ${pushRight} .2s linear;
`
