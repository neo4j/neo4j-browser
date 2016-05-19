import React from 'react'

export const Slide = ({html}) => {
  return (
    <div dangerouslySetInnerHTML={{__html: html}} />
    )
}
