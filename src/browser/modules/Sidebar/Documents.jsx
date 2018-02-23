/*
 * Copyright (c) 2002-2018 "Neo4j, Inc"
 * Network Engine for Objects in Lund AB [http://neotechnology.com]
 *
 * This file is part of Neo4j.
 *
 * Neo4j is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */

import DocumentItems from './DocumentItems'
import { Drawer, DrawerBody, DrawerHeader } from 'browser-components/drawer'

const staticItems = {
  intro: [
    { name: 'Getting started', command: ':play intro', type: 'play' },
    { name: 'Basic graph concepts', command: ':play concepts', type: 'play' },
    { name: 'Writing Cypher queries', command: ':play cypher', type: 'play' }
  ],
  help: [
    { name: 'Help', command: ':help help', type: 'help' },
    { name: 'Cypher syntax', command: ':help cypher', type: 'help' },
    { name: 'Available commands', command: ':help commands', type: 'help' },
    { name: 'Keyboard shortcuts', command: ':help keys', type: 'help' }
  ],
  reference: [
    {
      name: 'Developer Manual',
      command: 'https://neo4j.com/docs/developer-manual/3.2/',
      type: 'link'
    },
    {
      name: 'Operations Manual',
      command: 'https://neo4j.com/docs/operations-manual/3.2/',
      type: 'link'
    },
    {
      name: 'Cypher Refcard',
      command: 'https://neo4j.com/docs/cypher-refcard/3.2/',
      type: 'link'
    },
    {
      name: 'GraphGists',
      command: 'https://neo4j.com/graphgists/',
      type: 'link'
    },
    {
      name: 'Developer Site',
      command: 'https://www.neo4j.com/developer/',
      type: 'link'
    },
    {
      name: 'Knowledge Base',
      command: 'https://neo4j.com/developer/kb/',
      type: 'link'
    }
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
