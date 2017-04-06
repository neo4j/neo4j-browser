import styled from 'styled-components'

export const H3 = styled.h3`
  font-weight: 500;
  font-size: 24px;
  font-family: ${props => props.theme.primaryFontFamily};
  color: ${props => props.theme.headerText};
`
export const H2 = (props) => {
  return (<h2 {...props} />)
}
export const H1 = (props) => {
  return (<h1 {...props} />)
}
export const H4 = (props) => {
  return (<h4 {...props} />)
}
export const H5 = (props) => {
  return (<h5 {...props} />)
}
