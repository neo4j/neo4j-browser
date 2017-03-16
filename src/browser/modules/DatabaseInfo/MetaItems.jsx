import classNames from 'classnames'
import styles from './style_meta.css'
import {DrawerSubHeader, DrawerSection, DrawerSectionBody} from 'browser-components/drawer'
import {StyledLabel, StyledRelationship, StyledProperty} from './styled'

const createItems = (originalList, onItemClick, RenderType, editorCommandTemplate, showStar = true) => {
  let items = [...originalList]
  if (showStar) {
    items.unshift('*')
  }
  return items.map((text, index) => {
    const getNodesCypher = editorCommandTemplate(text)
    return (
      <RenderType.component
        key={index}
        onClick={() => onItemClick(getNodesCypher)}>
        {text}
      </RenderType.component>
    )
  })
}
const LabelItems = ({labels, onItemClick}) => {
  let labelItems = <p>There are no labels in database</p>
  if (labels.length > 0) {
    const editorCommandTemplate = (text) => {
      if (text === '*') {
        return 'MATCH (n) RETURN n LIMIT 25'
      }
      return `MATCH (n:${text}) RETURN n LIMIT 25`
    }
    labelItems = createItems(labels, onItemClick, {component: StyledLabel}, editorCommandTemplate)
  }
  return (
    <DrawerSection>
      <DrawerSubHeader>Node Labels</DrawerSubHeader>
      <DrawerSectionBody className={classNames({
        [styles['wrapper']]: true
      })}>
        {labelItems}
      </DrawerSectionBody>
    </DrawerSection>
  )
}
const RelationshipItems = ({relationshipTypes, onItemClick}) => {
  let relationshipItems = <p>No relationships in database</p>
  if (relationshipTypes.length > 0) {
    const editorCommandTemplate = (text) => {
      if (text === '*') {
        return 'MATCH ()-[r]->() RETURN r LIMIT 25'
      }
      return `MATCH p=()-[r:${text}]->() RETURN p LIMIT 25`
    }
    relationshipItems = createItems(relationshipTypes, onItemClick, {component: StyledRelationship}, editorCommandTemplate)
  }
  return (
    <DrawerSection>
      <DrawerSubHeader>Relationship Types</DrawerSubHeader>
      <DrawerSectionBody className={classNames({
        [styles['wrapper']]: true
      })}>
        {relationshipItems}
      </DrawerSectionBody>
    </DrawerSection>
  )
}
const PropertyItems = ({properties, onItemClick}) => {
  let propertyItems = <p>There are no properites in database</p>
  if (properties.length > 0) {
    const editorCommandTemplate = (text) => {
      return `MATCH (n) WHERE EXISTS(n.${text}) RETURN DISTINCT "node" as element, n.${text} AS ${text} LIMIT 25 UNION ALL MATCH ()-[r]-() WHERE EXISTS(r.${text}) RETURN DISTINCT "relationship" AS element, r.${text} AS ${text} LIMIT 25`
    }
    propertyItems = createItems(properties, onItemClick, {component: StyledProperty}, editorCommandTemplate, false)
  }
  return (
    <DrawerSection>
      <DrawerSubHeader>Property Keys</DrawerSubHeader>
      <DrawerSectionBody className={classNames({
        [styles['wrapper']]: true
      })}>
        {propertyItems}
      </DrawerSectionBody>
    </DrawerSection>
  )
}

export {
  LabelItems,
  RelationshipItems,
  PropertyItems
}
