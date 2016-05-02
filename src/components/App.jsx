import React from 'react'
import LeftNav from './LeftNav'

export default function App ({ children }) {
  const wrapperStyle = {
    display: 'flex',
    flexDirection: 'row',
    height: '100vh'
  }
  const mainStyle = {
    flex: '1',
    backgroundColor: '#fdfdfd'
  }
  return (
    <div id='wrapper' style={wrapperStyle}>
      <LeftNav />
      <div id='main' style={mainStyle}>hello main</div>
    </div>
  )
}
