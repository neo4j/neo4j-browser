import styled from 'styled-components'

export const ApplyButton = styled.button<{
  backgroundColor?: string
}>`
  padding: 3px 15px;
  color: ${({ theme }) => theme.primaryHeaderText}
  border: 1px solid #8b8b8b;
  border-radius: 1px;
  background: ${({ theme, backgroundColor }) =>
    backgroundColor ?? theme.primaryButtonBackground};

  &:hover {
    background: ${({ theme }) => theme.hoverBackground}
  }
`
export const SimpleButton = styled.button`
  padding: 3px 15px;
  border-radius: 1px;
  border: 1px solid #6f6f6f;
  margin: 0 20px;
  ${({ theme }) => {
    const { secondaryButtonBorder, secondaryButtonBackground } = theme
    return {
      border: secondaryButtonBorder,
      background: secondaryButtonBackground
    }
  }}
  &:hover {
    ${({ theme }) => {
      const {
        secondaryButtonTextHover,
        secondaryButtonBorderHover,
        secondaryButtonBackgroundHover
      } = theme
      return {
        color: secondaryButtonTextHover,
        border: secondaryButtonBorderHover,
        background: secondaryButtonBackgroundHover
      }
    }}
  }
`
