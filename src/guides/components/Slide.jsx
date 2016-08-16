import React from 'react'

const Slide = ({html}) => {
  return (<div className='slide' dangerouslySetInnerHTML={{__html: html}} />)
}

export default Slide
