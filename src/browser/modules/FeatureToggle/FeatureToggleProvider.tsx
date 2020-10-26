import React from 'react'
import { connect } from 'react-redux'
import { getExperimentalFeatures } from 'shared/modules/experimentalFeatures/experimentalFeaturesDuck'

const FeatureToggleContext = new React.createContext(() => true) // eslint-disable-line new-cap

class FeatureToggleProvider extends React.Component {
  showFeature = featureName => {
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

const mapStateToProps = state => {
  const features = getExperimentalFeatures(state)
  return {
    features
  }
}

const Consumer = FeatureToggleContext.Consumer

export default connect(mapStateToProps)(FeatureToggleProvider)
export { Consumer, FeatureToggleProvider }
