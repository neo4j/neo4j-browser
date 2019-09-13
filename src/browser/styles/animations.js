import { keyframes } from 'styled-components'

export const fadeInLeft = keyframes`
  from {
    opacity: 0;
    transform: translate3d(-50%, 0, 0);
  }

  to {
    opacity: 1;
    transform: translate3d(0, 0, 0);
  }
`

export const pulse = keyframes`
  0%, 90% {
    transform: scale3d(1, 1, 1);
  }

  95% {
    transform: scale3d(1.05, 1.05, 1.05);
  }

  100% {
    transform: scale3d(1, 1, 1);
  }
`

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
