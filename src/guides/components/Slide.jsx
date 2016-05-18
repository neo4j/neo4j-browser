import React from 'React'

export const Slide = ({html}) => {
  return (
    <div dangerouslySetInnerHTML={{__html: html}} />
    )
}
