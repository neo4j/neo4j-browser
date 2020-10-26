import React from 'react'
import { Consumer } from './FeatureToggleProvider'

const FeatureToggle = ({ name, on, off }) => {
  return (
    <Consumer>
      {showFeature => {
        if (!name) {
          throw new Error(
            'No "name" property provided to FeatureToggle component.'
          )
        }
        const shouldShow = showFeature(name)
        if (!shouldShow && !off) {
          return null
        }
        if (shouldShow && !on) {
          throw new Error(
            `No "on" property available for this enabled feature: ${name} for FeatureToggle component.`
          )
        }
        return shouldShow ? on : off
      }}
    </Consumer>
  )
}

export default FeatureToggle
