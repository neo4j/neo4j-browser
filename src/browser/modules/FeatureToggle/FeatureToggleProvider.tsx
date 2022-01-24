import React from 'react'
import { connect } from 'react-redux'

import { getExperimentalFeatures } from 'shared/modules/experimentalFeatures/experimentalFeaturesDuck'

// @ts-expect-error ts-migrate(7009) FIXME: 'new' expression, whose target lacks a construct s... Remove this comment to see the full error message
const FeatureToggleContext = new React.createContext(() => true)

class FeatureToggleProvider extends React.Component<any> {
  showFeature = (featureName: any) => {
    if (
      !this.props.features ||
      !this.props.features.hasOwnProperty(featureName)
    ) {
      return true
    }
    return !!this.props.features[featureName].on
  }

  render() {
    return (
      <FeatureToggleContext.Provider value={this.showFeature}>
        {this.props.children}
      </FeatureToggleContext.Provider>
    )
  }
}

const mapStateToProps = (state: any) => {
  const features = getExperimentalFeatures(state)
  return {
    features
  }
}

const Consumer = FeatureToggleContext.Consumer

export default connect<any, any, any, any>(mapStateToProps)(
  FeatureToggleProvider
)
export { Consumer, FeatureToggleProvider }
