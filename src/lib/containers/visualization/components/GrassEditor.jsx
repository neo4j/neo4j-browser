import React from 'react'
import neo4jVisualization from 'neo4j-visualization'
import { connect } from 'react-redux'
import { getGraphStyleData } from '../reducer'
import bolt from '../../../../services/bolt/bolt'
import styles from './style.css'
import { updateGraphStyleData } from '../actions'

const createItems = (originalList, onItemClick, className) => {
  let items = [...originalList]
  return items.map((text, index) => {
    return <button onClick={() => onItemClick(text)} className={className} key={index}>{text}</button>
  })
}

const labelItems = (labels, onItemClick) => {
  let labelItems = <p>There are no labels in database</p>
  if (labels.length > 0) {
    labelItems = createItems(labels, onItemClick, 'token-label')
  }
  return (
    <div>
      <h5> Node Labels </h5>
      {labelItems}
    </div>
  )
}

export class GrassEditorComponent extends React.Component {
  constructor (props) {
    super(props)
    this.state = {nodes: [], relationships: []}
    this.graphStyle = neo4jVisualization.neoGraphStyle()
    this.graphStyle.loadRules(props.graphStyleData)
  }

  getNodeToEditLabelStyle (label) {
    let getNodeForLabelCypher = `MATCH (n:${label}) RETURN n LIMIT 5`
    bolt.transaction(getNodeForLabelCypher).then((result) => {
      const {nodes, relationships} = bolt.extractNodesAndRelationshipsFromRecords(result.records)
      this.setState({nodes: nodes, relationships: relationships})
    })
  }

  onItemClick (label) {
    this.setState({selectedLabel: label})
    this.getNodeToEditLabelStyle(label)
  }

  sizePicker () {
    return this.graphStyle.defaultSizes().map((size) => {
      const onClick = () => {
        let labelStyle = this.graphStyle.forNode({labels: [this.state.selectedLabel]})
        this.graphStyle.changeForSelector(labelStyle.selector, size)
        this.onItemClick(this.state.selectedLabel)
        this.props.update(this.graphStyle.toSheet())
      }
      const style = {width: size.diameter, height: size.diameter}
      return (
        <li onClick={onClick} className={'size-picker-item'}>
          <a style={style}/>
        </li>
      )
    })
  }

  colorPicker () {
    return this.graphStyle.defaultColors().map((color) => {
      const onClick = () => {
        let labelStyle = this.graphStyle.forNode({labels: [this.state.selectedLabel]})
        this.graphStyle.changeForSelector(labelStyle.selector, color)
        this.onItemClick(this.state.selectedLabel)
        this.props.update(this.graphStyle.toSheet())
      }
      const style = {'backgroundColor': color.color}
      return (
        <li onClick={onClick} className={'color-picker-item'}>
          <a style={style}/>
        </li>
      )
    })
  }

  stylePicker () {
    if (this.state.selectedLabel) {
      let styleForLabel = this.graphStyle.forNode({labels: [this.state.selectedLabel]})
      const style = {'backgroundColor': styleForLabel.get('color'), 'color': styleForLabel.get('text-color-internal')}
      return (
        <div className={styles['style-picker']}>
          <h1 className={`${styles.token} ${styles['token-label']}`} style={style}>{this.state.selectedLabel}</h1>
          <ul>
            <li>
              Size:
              <ul className={styles['size-picker']}>
                {this.sizePicker()}
              </ul>
            </li>
            <li>
              Color:
              <ul className={styles['size-picker']}>
                {this.colorPicker()}
              </ul>
            </li>
          </ul>
        </div>
      )
    }
    return null
  }

  render () {
    return (
      <div className={styles['grass-editor']}>
        <div className={styles['grass-editor-card']}>
          {labelItems(this.props.meta.labels.map((l) => l.val), this.onItemClick.bind(this))}
          <neo4jVisualization.GraphComponent nodes={this.state.nodes} relationships={this.state.relationships} graphStyle={this.graphStyle} onItemMouseOver={() => {}} onGraphModelChange={() => {}}/>
          {this.stylePicker()}
        </div>
      </div>
    )
  }
}
const mapStateToProps = (state) => {
  return {
    graphStyleData: getGraphStyleData(state),
    meta: state.meta
  }
}

const mapDispatchToProps = (dispatch) => {
  return {
    update: (data) => {
      dispatch(updateGraphStyleData(data))
    }
  }
}

export const GrassEditor = connect(mapStateToProps, mapDispatchToProps)(GrassEditorComponent)
