import { Component } from 'preact'
import { connect } from 'preact-redux'
import * as actions from 'shared/modules/visualization/visualizationDuck'
import { NevadaWrapper } from '../NevadaVisualization/NevadaWrapper'
import bolt from 'services/bolt/bolt'
import { withBus } from 'preact-suber'
import { ExplorerComponent } from '../D3Visualization/components/Explorer'
import { StyledNevadaCanvas } from './styled'
import { getUseNewVisualization } from 'shared/modules/settings/settingsDuck'

import { CYPHER_REQUEST } from 'shared/modules/cypher/cypherDuck'

export class Visualization extends Component {
  constructor (props) {
    super(props)
    this.state = {}
    this.state.useNewVis = this.props.useNewVis
  }

  shouldComponentUpdate (nextProps) {
    return nextProps.records !== this.props.records || nextProps.graphStyleData !== this.props.graphStyleData
  }

  componentWillReceiveProps (nextProps) {
    if (nextProps.records !== this.props.records) {
      if (this.state.useNewVis) {
        this.setState({nodesAndRelationships: bolt.extractNodesAndRelationshipsFromRecords(this.props.records)})
      } else {
        this.setState({nodesAndRelationships: bolt.extractNodesAndRelationshipsFromRecordsForOldVis(nextProps.records)})
      }
    }
  }

  getNeighbours (id) {
    return new Promise((resolve, reject) => {
      this.props.bus.self(
        CYPHER_REQUEST,
        {query: `MATCH path = (a)-[r]-(o) WHERE id(a)= ${id} RETURN r, o`},
        (response) => {
          if (!response.success) {
            reject({nodes: [], rels: []})
          } else {
            if (this.state.useNewVis) {
              resolve(bolt.extractNodesAndRelationshipsFromRecords(response.result.records))
            } else {
              resolve(bolt.extractNodesAndRelationshipsFromRecordsForOldVis(response.result.records, false))
            }
          }
        }
      )
    })
  }

  render () {
    if (this.state.useNewVis) {
      this.state.nodesAndRelationships = this.state.nodesAndRelationships || bolt.extractNodesAndRelationshipsFromRecords(this.props.records)
      return (
        <StyledNevadaCanvas>
          <NevadaWrapper onLabelsSave={this.props.onLabelsSave} labels={this.props.labels} getNeighbours={this.getNeighbours.bind(this)} nodes={this.state.nodesAndRelationships.nodes} relationships={this.state.nodesAndRelationships.relationships} />
        </StyledNevadaCanvas>
      )
    } else {
      this.state.nodesAndRelationships = this.state.nodesAndRelationships || bolt.extractNodesAndRelationshipsFromRecordsForOldVis(this.props.records)
      return (
        <ExplorerComponent graphStyleData={this.props.graphStyleData} updateStyle={this.props.updateStyle} getNeighbours={this.getNeighbours.bind(this)} nodes={this.state.nodesAndRelationships.nodes} relationships={this.state.nodesAndRelationships.relationships} />
      )
    }
  }
}

const mapStateToProps = (state) => {
  return {
    labels: actions.getLabels(state),
    graphStyleData: actions.getGraphStyleData(state),
    useNewVis: getUseNewVisualization(state)
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
