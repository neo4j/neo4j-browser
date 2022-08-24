/*
 * Copyright (c) "Neo4j"
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

import {
  Drawer,
  DrawerBody,
  DrawerExternalLink,
  DrawerFooter,
  DrawerHeader,
  DrawerSection,
  DrawerSectionBody,
  DrawerSubHeader
} from 'browser-components/drawer/drawer-styled'
import { version as browserVersion } from 'project-root/package.json'
import { getEdition, getRawVersion } from 'shared/modules/dbMeta/dbMetaDuck'
import { copyToClipboard } from 'neo4j-arc/common'
import { GlobalState } from 'shared/globalState'

function asChangeLogUrl(serverVersion: string): string | undefined {
  if (!serverVersion) {
    return undefined
  }
  const tokenisedServerVersion = serverVersion.split('.')
  const releaseTag = tokenisedServerVersion.join('')
  const urlServerVersion =
    serverVersion && tokenisedServerVersion.splice(0, 2).join('.')
  return `https://github.com/neo4j/neo4j/wiki/Neo4j-${urlServerVersion}-changelog#${releaseTag}`
}

interface AboutProps {
  serverVersion: string | null
  serverEdition: string | null
}

// Injected by webpack
declare const __GIT_HASH__: string | undefined
declare const __BUILD_NUMBER__: string | undefined
declare const __BUILT_AT__: string | undefined

const About = ({ serverVersion, serverEdition }: AboutProps) => (
  <Drawer id="db-about">
    <DrawerHeader>About Neo4j</DrawerHeader>
    <DrawerBody>
      <DrawerSection>
        <DrawerSubHeader>
          Made by{' '}
          <DrawerExternalLink href="http://neo4j.com/">
            Neo4j, Inc
          </DrawerExternalLink>
        </DrawerSubHeader>
      </DrawerSection>
      <DrawerSection>
        <DrawerSectionBody>
          Copyright &#169; 2002-{new Date().getFullYear()}
        </DrawerSectionBody>
      </DrawerSection>
      <DrawerSection>
        <DrawerSubHeader>You are running</DrawerSubHeader>
        <DrawerSectionBody>
          <p>
            Neo4j Browser version:{' '}
            <DrawerExternalLink
              href={`https://github.com/neo4j/neo4j-browser/releases/tag/${browserVersion}`}
            >
              {browserVersion}
            </DrawerExternalLink>
          </p>
          {serverVersion && serverEdition && (
            <p>
              Neo4j Server version:{' '}
              <DrawerExternalLink href={asChangeLogUrl(serverVersion)}>
                {serverVersion}
              </DrawerExternalLink>{' '}
              ({serverEdition})
            </p>
          )}
          <p>
            <DrawerExternalLink href="https://github.com/neo4j/neo4j-browser/wiki/changelog">
              Neo4j Browser Changelog
            </DrawerExternalLink>
          </p>
          {__BUILD_NUMBER__ && (
            <div onClick={() => copyToClipboard(__BUILD_NUMBER__)}>
              Build number: {__BUILD_NUMBER__}
            </div>
          )}
          {__GIT_HASH__ && (
            <div onClick={() => copyToClipboard(__GIT_HASH__)}>
              Build hash: {__GIT_HASH__.slice(0, 18)}
            </div>
          )}
          {__BUILT_AT__ && (
            <div onClick={() => copyToClipboard(__BUILT_AT__)}>
              Build date: {new Date(__BUILT_AT__).toLocaleDateString('se')}
            </div>
          )}
        </DrawerSectionBody>
      </DrawerSection>
      <DrawerSection>
        <DrawerSubHeader>License</DrawerSubHeader>
        <DrawerSectionBody>
          <DrawerExternalLink href="http://www.gnu.org/licenses/gpl.html">
            GPLv3
          </DrawerExternalLink>{' '}
          or{' '}
          <DrawerExternalLink href="http://www.gnu.org/licenses/agpl-3.0.html">
            AGPL
          </DrawerExternalLink>{' '}
          for Open Source, and{' '}
          <DrawerExternalLink href="https://neo4j.com/licensing/">
            NTCL
          </DrawerExternalLink>{' '}
          Commercial.
        </DrawerSectionBody>
      </DrawerSection>
      <DrawerSection>
        <DrawerSubHeader>Participate</DrawerSubHeader>
        <DrawerSectionBody>
          Discuss on{' '}
          <DrawerExternalLink href="https://community.neo4j.com/">
            Neo4j Community Forum
          </DrawerExternalLink>{' '}
          <br />
          Ask questions at{' '}
          <DrawerExternalLink href="http://stackoverflow.com/questions/tagged/neo4j">
            Stack Overflow
          </DrawerExternalLink>
          <br />
          Visit a local{' '}
          <DrawerExternalLink href="http://neo4j.meetup.com/">
            Meetup Group
          </DrawerExternalLink>
          <br />
          Contribute code to{' '}
          <DrawerExternalLink href="http://github.com/neo4j">
            Neo4j
          </DrawerExternalLink>{' '}
          or{' '}
          <DrawerExternalLink href="http://github.com/neo4j/neo4j-browser">
            Neo4j Browser
          </DrawerExternalLink>
          <br />
          Send us your Browser feedback via{' '}
          <DrawerExternalLink href="mailto:browser@neotechnology.com?subject=Neo4j Browser feedback">
            email
          </DrawerExternalLink>
        </DrawerSectionBody>
      </DrawerSection>
      <DrawerSection>
        <DrawerSubHeader>Thanks</DrawerSubHeader>
        <DrawerSectionBody>
          {`Neo4j wouldn't be possible without a fantastic community. Thanks for all the feedback, discussions and contributions.`}
        </DrawerSectionBody>
      </DrawerSection>
    </DrawerBody>
    <DrawerFooter>With &#9829; from Sweden.</DrawerFooter>
  </Drawer>
)

const mapStateToProps = (state: GlobalState) => ({
  serverVersion: getRawVersion(state),
  serverEdition: getEdition(state)
})

export default connect(mapStateToProps)(About)
