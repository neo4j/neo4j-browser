import React from 'react'

export const Query = ({className, onClick}) => {
  return <li className={className} onClick={onClick}>Query</li>
}

export const DatabaseInfo = ({className, onClick}) => {
  return <li className={className} onClick={onClick}>Database Info</li>
}

export const Settings = ({className, onClick}) => {
  return <li className={className} onClick={onClick}>Settings</li>
}

export const Favorites = ({className, onClick}) => {
  return <li className={className} onClick={onClick}>Favorites</li>
}

export const Styling = ({className, onClick}) => {
  return <li className={className} onClick={onClick}>Styling</li>
}

export const Separator = ({className}) => {
  return <li className={className}></li>
}
