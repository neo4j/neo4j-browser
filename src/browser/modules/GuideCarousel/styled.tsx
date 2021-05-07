import styled from 'styled-components'

export const PaginationItem = styled.span<{ active: boolean }>`
  padding: 0 3px;
  ${props => (props.active ? 'color: white;' : null)}
  cursor: pointer;
`
