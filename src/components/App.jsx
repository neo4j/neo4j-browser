import React from 'react'
import { Link } from 'react-router'

export default function App ({ children }) {
  return (
    <div>
      <header>
        Links:
        {' '}
        <Link to='/'>Home</Link>
        {' '}
        <Link to='/foo'>Foo</Link>
        {' '}
        <Link to='/bar'>Bar</Link>
      </header>
      <div style={{ marginTop: '1.5em' }}>{children}</div>
    </div>
  )
}
