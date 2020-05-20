/*
 * Copyright (c) 2002-2020 "Neo4j,"
 * Neo4j Sweden AB [http://neo4j.com]
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
import React from 'react'
import { connect } from 'react-redux'
import { version } from 'project-root/package.json'
import Render from 'browser-components/Render'
import {
  Drawer,
  DrawerBody,
  DrawerHeader,
  DrawerSubHeader,
  DrawerSection,
  DrawerSectionBody,
  DrawerFooter
} from 'browser-components/drawer'
import { getVersion, getEdition } from 'shared/modules/dbMeta/dbMetaDuck'

const About = ({ serverVersion, serverEdition }) => (
  <Drawer id="db-about">
    <DrawerHeader>About Neo4j</DrawerHeader>
    <DrawerBody>
      <DrawerSection>
        <DrawerSubHeader>
          Made by{' '}
          <a target="_blank" href="http://neo4j.com/">
            Neo4j, Inc
          </a>
        </DrawerSubHeader>
      </DrawerSection>
      <DrawerSection>
        <DrawerSectionBody>Copyright &#169; 2002-2020</DrawerSectionBody>
      </DrawerSection>
      <DrawerSection>
        <DrawerSubHeader>You are running</DrawerSubHeader>
        <DrawerSectionBody>
          <p>
            Neo4j Browser version:{' '}
            <a
              href={`https://github.com/neo4j/neo4j-browser/releases/tag/${version}`}
              target="_blank"
            >
              {version}
            </a>
          </p>
          <Render if={serverVersion && serverEdition}>
            <p>
              Neo4j Server version:{' '}
              <a target="_blank" href={asChangeLogUrl(serverVersion)}>
                {serverVersion}
              </a>{' '}
              ({serverEdition})
            </p>
          </Render>
          <p>
            <a
              href="https://github.com/neo4j/neo4j-browser/wiki/changelog"
              target="_blank"
            >
              Neo4j Browser Changelog
            </a>
          </p>
        </DrawerSectionBody>
      </DrawerSection>
      <DrawerSection>
        <DrawerSubHeader>License</DrawerSubHeader>
        <DrawerSectionBody>
          <a target="_blank" href="http://www.gnu.org/licenses/gpl.html">
            GPLv3
          </a>{' '}
          or{' '}
          <a target="_blank" href="http://www.gnu.org/licenses/agpl-3.0.html">
            AGPL
          </a>{' '}
          for Open Source, and{' '}
          <a target="_blank" href="https://neo4j.com/licensing/">
            NTCL
          </a>{' '}
          Commercial.
        </DrawerSectionBody>
      </DrawerSection>
      <DrawerSection>
        <DrawerSubHeader>Participate</DrawerSubHeader>
        <DrawerSectionBody>
          Discuss on{' '}
          <a target="_blank" href="https://community.neo4j.com/">
            Neo4j Community Forum
          </a>{' '}
          <br />
          Ask questions at{' '}
          <a
            target="_blank"
            href="http://stackoverflow.com/questions/tagged/neo4j"
          >
            Stack Overflow
          </a>
          <br />
          Visit a local{' '}
          <a target="_blank" href="http://neo4j.meetup.com/">
            Meetup Group
          </a>
          <br />
          Contribute code to{' '}
          <a target="_blank" href="http://github.com/neo4j">
            Neo4j
          </a>{' '}
          or{' '}
          <a target="_blank" href="http://github.com/neo4j/neo4j-browser">
            Neo4j Browser
          </a>
          <br />
          Send us your Browser feedback via{' '}
          <a href="mailto:browser@neotechnology.com?subject=Neo4j Browser feedback">
            email
          </a>
        </DrawerSectionBody>
      </DrawerSection>
      <DrawerSection>
        <DrawerSubHeader>Thanks</DrawerSubHeader>
        <DrawerSectionBody>
          Neo4j wouldn't be possible without a fantastic community. Thanks for
          all the feedback, discussions and contributions.
        </DrawerSectionBody>
      </DrawerSection>
    </DrawerBody>
    <DrawerFooter>With &#9829; from Sweden.</DrawerFooter>
  </Drawer>
)

const asChangeLogUrl = serverVersion => {
  if (!serverVersion) {
    return undefined
  }
  const tokenisedServerVersion = serverVersion && serverVersion.split('.')
  const releaseTag = tokenisedServerVersion.join('')
  const urlServerVersion =
    serverVersion && tokenisedServerVersion.splice(0, 2).join('.')
  return `https://github.com/neo4j/neo4j/wiki/Neo4j-${urlServerVersion}-changelog#${releaseTag}`
}

const mapStateToProps = state => {
  return {
    serverVersion: getVersion(state),
    serverEdition: getEdition(state)
  }
}

export default connect(mapStateToProps)(About)
