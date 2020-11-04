import React from 'react'

const Score = ({ score, initialLoad, playing }: any) => {
  if (initialLoad) {
    return null
  }
  return (
    <h3 style={{ textAlign: 'right' }}>
      {playing ? 'Current' : 'Final'} score: {score}
    </h3>
  )
}

export default Score
