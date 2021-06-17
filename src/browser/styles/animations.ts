import { keyframes } from 'styled-components'

export const bounceRight = keyframes`
  0%, 90% {
    transform: translate3d(0, 0, 0);
  }

  95% {
    transform: translate3d(5px, 0, 0);
  }

  100% {
    transform: translate3d(0, 0, 0);
  }
`
