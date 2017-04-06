import { Component } from 'preact'
import { connect } from 'preact-redux'
import * as actions from 'shared/modules/visualization/visualizationDuck'
import { NevadaWrapper } from '../NevadaVisualization/NevadaWrapper'
import bolt from 'services/bolt/bolt'
import { withBus } from 'preact-suber'
import { ExplorerComponent } from '../D3Visualization/components/Explorer'
import { StyledNevadaCanvas, StyledVisContainer } from './styled'
import { getUseNewVisualization, getSettings } from 'shared/modules/settings/settingsDuck'

import { CYPHER_REQUEST } from 'shared/modules/cypher/cypherDuck'

export class Visualization extends Component {
  constructor (props) {
    super(props)

    this.state = {
      nodesAndRelationships: {
        nodes: [],
        relationships: []
      },
      justInitiated: true,
      useNewVis: props.useNewVis
    }
  }

  componentWillMount () {
    if (this.props.records && this.props.records.length > 0) {
      this.populateDataToStateFromProps(this.props)
    }
  }

  shouldComponentUpdate (nextProps) {
    return nextProps.records !== this.props.records || nextProps.graphStyleData !== this.props.graphStyleData || nextProps.style !== this.props.style
  }

  componentWillReceiveProps (nextProps) {
    if (nextProps.records !== this.props.records) {
      this.populateDataToStateFromProps(nextProps)
    }

    if (nextProps.style.display !== this.props.style.display) {
      this.setState({justInitiated: false})
    }
  }

  populateDataToStateFromProps (props) {
    this.setState({nodesAndRelationships: this.state.useNewVis
      ? bolt.extractNodesAndRelationshipsFromRecords(props.records)
      : bolt.extractNodesAndRelationshipsFromRecordsForOldVis(props.records)
    })
  }

  getNeighbours (id, currentNeighbourIds = []) {
    let query = `MATCH path = (a)--(o)
                   WHERE id(a)= ${id}
                   AND NOT (id(o) IN[${currentNeighbourIds.join(',')}])
                   RETURN path, size((a)--()) as c
                   ORDER BY id(o)
                   LIMIT ${this.props.maxNeighbours - currentNeighbourIds.length}`
    return new Promise((resolve, reject) => {
      this.props.bus.self(
        CYPHER_REQUEST,
        {query: query},
        (response) => {
          if (!response.success) {
            reject({nodes: [], rels: []})
          } else {
            if (this.state.useNewVis) {
              resolve(bolt.extractNodesAndRelationshipsFromRecords(response.result.records))
            } else {
              let count = response.result.records.length > 0 ? parseInt(response.result.records[0].get('c').toString()) : 0
              resolve({...bolt.extractNodesAndRelationshipsFromRecordsForOldVis(response.result.records, false), count: count})
            }
          }
        }
      )
    })
  }

  render () {
    if (this.state.useNewVis) {
      return (
        <StyledNevadaCanvas>
          <NevadaWrapper onLabelsSave={this.props.onLabelsSave} labels={this.props.labels}
            getNeighbours={this.getNeighbours.bind(this)} nodes={this.state.nodesAndRelationships.nodes}
            relationships={this.state.nodesAndRelationships.relationships} />
        </StyledNevadaCanvas>
      )
    }

    // This workaround is to overcome the issue that if the svg is initiated with in a style.display = none component, it does not become visible even display changed to block or so
    if (this.state.justInitiated && this.props.style.display === 'none') {
      return null
    }

    return (
      <StyledVisContainer style={this.props.style} >
        <ExplorerComponent maxNeighbours={this.props.maxNeighbours} initialNodeDisplay={this.props.initialNodeDisplay} graphStyleData={this.props.graphStyleData} updateStyle={this.props.updateStyle}
          getNeighbours={this.getNeighbours.bind(this)} nodes={this.state.nodesAndRelationships.nodes}
          relationships={this.state.nodesAndRelationships.relationships} fullscreen={this.props.fullscreen} frameHeight={this.props.frameHeight} />
      </StyledVisContainer>
    )
  }
}

const mapStateToProps = (state) => {
  return {
    labels: actions.getLabels(state),
    graphStyleData: actions.getGraphStyleData(state),
    useNewVis: getUseNewVisualization(state),
    initialNodeDisplay: getSettings(state).initialNodeDisplay,
    maxNeighbours: getSettings(state).maxNeighbours
  }
}

const mapDispatchToProps = (dispatch) => {
  return {
    onLabelsSave: (labels) => {
      dispatch(actions.updateLabels(labels))
    },
    updateStyle: (graphStyleData) => {
      dispatch(actions.updateGraphStyleData(graphStyleData))
    }
  }
}

export default withBus(connect(mapStateToProps, mapDispatchToProps)(Visualization))
