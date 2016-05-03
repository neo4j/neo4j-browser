import React from 'react'
import Sidebar from './Sidebar'
import Main from './Main'

export default function App ({ children }) {
  const wrapperStyle = {
    display: 'flex',
    flexDirection: 'row',
    height: '100vh'
  }
  return (
    <div id='wrapper' style={wrapperStyle}>
      <Sidebar />
      <Main />
    </div>
  )
}
