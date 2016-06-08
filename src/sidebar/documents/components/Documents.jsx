import React from 'react'
import { DocumentItems } from './DocumentItems'

const staticItems = {
  intro: [
    {name: 'Getting started', command: ':play intro'},
    {name: 'Basic graph concepts', command: ':play graphs'},
    {name: 'Writing Cypher queries', command: ':play cypher'}
  ],
  reference: [
    {name: 'Developer Manual', command: 'http://neo4j.com/docs/developer-manual/3.0/', type: 'link'},
    {name: 'Operations Manual', command: 'http://neo4j.com/docs/operations-manual/3.0/', type: 'link'},
    {name: 'Cypher', command: 'http://neo4j.com/docs/cypher-refcard/3.0/', type: 'link'},
    {name: 'GraphGists', command: 'http://graphgist.neo4j.com/', type: 'link'}
  ],
  help: [
    {name: 'Help', command: ':help help'},
    {name: 'Cypher syntax', command: ':help cypher'},
    {name: 'Available commands', command: ':help commands'},
    {name: 'Keyboard shortcuts', command: ':help keys'}
  ]
}

export const DocumentsComponent = ({ items = staticItems }) => {
  return (
    <div id='db-documents'>
      <h4>Documents</h4>
      <DocumentItems header={'Introduction'} items={items.intro}/>
      <DocumentItems header={'Reference Library'} items={items.reference}/>
      <DocumentItems header={'Help'} items={items.help}/>
    </div>
  )
}
