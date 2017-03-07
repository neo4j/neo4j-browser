import DocumentItems from './DocumentItems'
import { Drawer, DrawerBody, DrawerHeader } from 'browser-components/drawer'

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

const Documents = ({ items = staticItems }) => {
  return (
    <Drawer id='db-documents'>
      <DrawerHeader title='Documents' />
      <DrawerBody>
        <DocumentItems header={'Introduction'} items={items.intro} />
        <DocumentItems header={'Reference Library'} items={items.reference} />
        <DocumentItems header={'Help'} items={items.help} />
      </DrawerBody>
    </Drawer>
  )
}

export default Documents
