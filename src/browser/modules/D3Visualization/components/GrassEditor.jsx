import { Component } from 'preact'
import neo4jVisualization from 'neo4j-visualization'
import { connect } from 'react-redux'
import { getGraphStyleData } from '../reducer'
import bolt from 'services/bolt/bolt'
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
const relTypeItems = (relTypes, onItemClick) => {
  let relTypeItems = <p>There are no labels in database</p>
  if (relTypes.length > 0) {
    relTypeItems = createItems(relTypes, onItemClick, 'token-relationship')
  }
  return (
    <div>
      <h5> Relationship Types Labels </h5>
      {relTypeItems}
    </div>
  )
}

const getLabelCypher = (label) => {
  return `MATCH (n:${label}) RETURN n LIMIT 1`
}

const getRelTypeCypher = (relType) => {
  return `MATCH p=()-[r:${relType}]->() RETURN p LIMIT 1`
}

export class GrassEditorComponent extends React.Component {
  constructor (props) {
    super(props)
    this.state = {nodes: [], relationships: []}
    this.graphStyle = neo4jVisualization.neoGraphStyle()
    this.graphStyle.loadRules(props.graphStyleData)
  }

  getVisualizationData (cypher) {
    bolt.transaction(cypher).then((result) => {
      const {nodes, relationships} = bolt.extractNodesAndRelationshipsFromRecords(result.records)
      this.setState({nodes: nodes, relationships: relationships})
    }).catch((_) => { })
  }

  onLabelItemClick (label) {
    this.setState({selectedRelType: false})
    this.setState({selectedLabel: label})
    this.getVisualizationData(getLabelCypher(label))
  }

  onRelTypeItemClick (relType) {
    this.setState({selectedLabel: false})
    this.setState({selectedRelType: relType})
    this.getVisualizationData(getRelTypeCypher(relType))
  }

  refreshVisualization () {
    if (this.state.selectedLabel) {
      this.getVisualizationData(getLabelCypher(this.state.selectedLabel))
    } else if (this.state.selectedRelType) {
      this.getVisualizationData(getRelTypeCypher(this.state.selectedRelType))
    }
  }

  picker (styleProps, styleProvider, className, selector, textProvider = () => { return '' }) {
    return styleProps.map((styleProp, i) => {
      const onClick = () => {
        this.graphStyle.changeForSelector(selector, styleProp)
        this.refreshVisualization()
        this.props.update(this.graphStyle.toSheet())
      }
      const style = styleProvider(styleProp)
      const text = textProvider(styleProp)
      return (
        <li onClick={onClick} className={className} key={i}>
          <a style={style}>{text}</a>
        </li>
      )
    })
  }

  colorPicker (selector) {
    return (
      <li key='color-picker'>
        Color:
        <ul className={`${styles['color-picker']} ${styles['picker']}`}>
          {this.picker(this.graphStyle.defaultColors(), (color) => { return {'backgroundColor': color.color} }, 'color-picker-item', selector)}
        </ul>
      </li>
    )
  }
  sizePicker (selector) {
    return (
      <li key='size-picker'>
        Size:
        <ul className={`${styles['size-picker']} ${styles['picker']}`}>
          {this.picker(this.graphStyle.defaultSizes(), (size) => { return { width: size.diameter, height: size.diameter } }, 'size-picker-item', selector)}
        </ul>
      </li>
    )
  }
  widthPicker (selector) {
    return (
      <li key='width-picker'>
        Line width:
        <ul className={`${styles['width-picker']} ${styles['picker']}`}>
          {this.picker(this.graphStyle.defaultArrayWidths(), (width) => { return { width: width['shaft-width'], height: '24px' } }, 'width-picker-item', selector)}
        </ul>
      </li>
    )
  }

  iconPicker (selector) {
    return (
      <li key='icon-picker'>
        Icon:
        <ul className={`${styles['icon-picker']} ${styles['picker']}`}>
          {this.picker(this.graphStyle.defaultIconCodes(), (iconCode) => { return { 'fontFamily': 'streamline' } }, 'icon-picker-item', selector, (iconCode) => { return iconCode['icon-code'] })}
        </ul>
      </li>
    )
  }

  stylePicker () {
    let pickers
    let title
    if (this.state.selectedLabel) {
      const styleForLabel = this.graphStyle.forNode({ labels: [this.state.selectedLabel] })
      const inlineStyle = {'backgroundColor': styleForLabel.get('color'), 'color': styleForLabel.get('text-color-internal')}
      pickers = [this.sizePicker(styleForLabel.selector), this.colorPicker(styleForLabel.selector), this.iconPicker(styleForLabel.selector)]
      title = (<h1 className={`${styles.token} ${styles['token-label']}`} style={inlineStyle}>{this.state.selectedLabel}</h1>)
    } else if (this.state.selectedRelType) {
      const styleForRelType = this.graphStyle.forRelationship({type: this.state.selectedRelType})
      const inlineStyle = {'backgroundColor': styleForRelType.get('color'), 'color': styleForRelType.get('text-color-internal')}
      pickers = [this.colorPicker(styleForRelType.selector), this.widthPicker(styleForRelType.selector)]
      title = <h1 className={`${styles.token} ${styles['token-relationship']}`} style={inlineStyle}>{this.state.selectedRelType}</h1>
    } else {
      return null
    }
    return (
      <div className={styles['style-picker']}>
        {title}
        <ul>
          {pickers}
        </ul>
      </div>
    )
  }

  render () {
    return (
      <div className={styles['grass-editor']}>
        <div className={styles['grass-editor-card']}>
          {labelItems(this.props.meta.labels.map((l) => l.val), this.onLabelItemClick.bind(this))}
          {relTypeItems(this.props.meta.relationshipTypes.map((l) => l.val), this.onRelTypeItemClick.bind(this))}
          <div className={styles.exampleVisualization}>
            <neo4jVisualization.GraphComponent nodes={this.state.nodes} relationships={this.state.relationships} graphStyle={this.graphStyle} onItemMouseOver={() => {}} onGraphModelChange={() => {}} />
          </div>
          <div className={styles.editor}>
            {this.stylePicker()}
            <div className={styles.graphStyleTextView}>
              <pre>
                {JSON.stringify(this.props.graphStyleData, null, '\t')}
              </pre>
            </div>
          </div>
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
