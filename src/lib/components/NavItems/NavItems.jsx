import React from 'react'

export const Query = ({onClick}) => {
  return <li onClick={onClick}>Query</li>
}

export const DatabaseInfo = ({onClick}) => {
  return <li onClick={onClick}>Database Info</li>
}

export const Settings = ({onClick}) => {
  return <li onClick={onClick}>Settings</li>
}

export const Favorites = ({onClick}) => {
  return <li onClick={onClick}>Favorites</li>
}

export const Styling = ({onClick}) => {
  return <li onClick={onClick}>Styling</li>
}

export const Separator = ({className}) => {
  return <li className={className}></li>
}
