import styled from 'styled-components'

export const PaginationItem = styled.span<{ active: boolean }>`
  padding: 0 3px;
  color: ${props => (props.active ? 'white' : '#888')};
  cursor: pointer;
`

export const Dots = styled.span`
  color: #888;
`
