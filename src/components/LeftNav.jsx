import React from 'react'

export default function LeftNav ({ children }) {
  const navStyle = {
    flex: '0 0 70px',
    backgroundColor: '#dddddd'
  }
  const drawerStyle = {
    flex: '0 0 70px'
  }
  return (
    <div id='nav' style={navStyle}>
      <ul>
        <li>DB</li>
        <li>Fav</li>
      </ul>
      <div id='drawer' style={drawerStyle}></div>
    </div>
  )
}
