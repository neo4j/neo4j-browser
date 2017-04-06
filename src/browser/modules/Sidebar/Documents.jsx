import DocumentItems from './DocumentItems'
import { Drawer, DrawerBody, DrawerHeader } from 'browser-components/drawer'

const staticItems = {
  intro: [
    {name: 'Getting started', command: ':play intro', type: 'play'},
    {name: 'Basic graph concepts', command: ':play graphs', type: 'play'},
    {name: 'Writing Cypher queries', command: ':play cypher', type: 'play'}
  ],
  help: [
    {name: 'Help', command: ':help help', type: 'help'},
    {name: 'Cypher syntax', command: ':help cypher', type: 'help'},
    {name: 'Available commands', command: ':help commands', type: 'help'},
    {name: 'Keyboard shortcuts', command: ':help keys', type: 'help'}
  ],
  reference: [
    {name: 'Developer Manual', command: 'http://neo4j.com/docs/developer-manual/3.2-alpha/', type: 'link'},
    {name: 'Operations Manual', command: 'http://neo4j.com/docs/operations-manual/3.2-alpha/', type: 'link'},
    {name: 'Cypher Refcard', command: 'http://neo4j.com/docs/cypher-refcard/3.2-alpha/', type: 'link'},
    {name: 'GraphGists', command: 'http://graphgist.neo4j.com/', type: 'link'},
    {name: 'Developer Site', command: 'http://www.neo4j.com/developer', type: 'link'},
    {name: 'Developer Site', command: 'https://neo4j.com/developer/kb/', type: 'link'}
  ]
}

const Documents = ({ items = staticItems }) => {
  return (
    <Drawer id='db-documents'>
      <DrawerHeader>Documents</DrawerHeader>
      <DrawerBody>
        <DocumentItems header={'Introduction'} items={items.intro} />
        <DocumentItems header={'Help'} items={items.help} />
        <DocumentItems header={'Useful Resources'} items={items.reference} />
      </DrawerBody>
    </Drawer>
  )
}

export default Documents
