import styled from 'styled-components'

export const PaginationItem = styled.span<{ active: boolean }>`
  padding: 0 3px;
  color: ${props => (props.active ? 'white' : 'inherit')};
  cursor: pointer;
`
