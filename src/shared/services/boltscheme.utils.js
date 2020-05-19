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

const BOLT_DIRECT_SCHEME = 'bolt'
const BOLT_ROUTING_SCHEME = 'neo4j'

export const isNonSupportedRoutingSchemeError = e =>
  e.code === 'ServiceUnavailable' &&
  e.message.includes('Could not perform discovery')

export const isNonRoutingScheme = (url = '') =>
  typeof url === 'string' && url.startsWith(`${BOLT_DIRECT_SCHEME}://`)

export const toNonRoutingScheme = url =>
  typeof url === 'string' &&
  `${BOLT_DIRECT_SCHEME}${getSchemeFlag(url)}://${stripScheme(url)}`

export const getScheme = url => {
  if (!url) {
    return ''
  }
  if (url && !url.includes('://')) {
    return ''
  }
  const [scheme] = url.split('://')
  return scheme
}

export const stripScheme = url => {
  const [_scheme, ...rest] = (url || '').split('://')
  if (!rest || !rest.length) {
    return _scheme
  }
  return rest.join('://')
}

export const isSecureBoltScheme = url => {
  if (url && !url.includes('://')) {
    return false
  }
  const [scheme] = (url || '').split('://')
  if (!scheme) {
    return false
  }
  return scheme.endsWith('+s') || scheme.endsWith('+ssc')
}

export const getSchemeFlag = (url = '') => {
  if (url && !url.includes('://')) {
    return ''
  }
  const [scheme] = (url || '').split('://')
  if (!scheme.includes('+')) {
    return ''
  }
  return `+${scheme.split('+').pop()}`
}
const stripSchemeFlag = url => {
  if (url && !url.includes('://')) {
    return ''
  }
  const [scheme] = (url || '').split('://')
  if (!scheme.includes('+')) {
    return scheme
  }
  return scheme.split('+')[0]
}

const toggleSchemeSecurity = url => {
  if (url && !url.includes('://')) {
    return url
  }
  if (isSecureBoltScheme(url)) {
    return stripSchemeFlag(url)
  }
  return `${getScheme(url)}+s`
}

export const toggleSchemeRouting = (url = '') => {
  if (!url) {
    return ''
  }
  if (url && !url.includes('://')) {
    return url
  }

  if (url.startsWith(BOLT_ROUTING_SCHEME)) {
    return url.replace(BOLT_ROUTING_SCHEME, BOLT_DIRECT_SCHEME)
  }
  if (url.startsWith(BOLT_DIRECT_SCHEME)) {
    return url.replace(BOLT_DIRECT_SCHEME, BOLT_ROUTING_SCHEME)
  }
  return url
}

export const generateBoltUrl = (allowedSchemes, url, fallbackScheme) => {
  const rewrites = {
    'bolt+routing://': `${BOLT_ROUTING_SCHEME}://`
  }

  if (!url || typeof url !== 'string') {
    if (
      allowedSchemes &&
      fallbackScheme &&
      allowedSchemes.includes(fallbackScheme)
    ) {
      return `${fallbackScheme}://`
    }
    let scheme = allowedSchemes ? allowedSchemes[0] : fallbackScheme || 'neo4j'
    return `${scheme}://`
  }

  // Rewrite any alias. Break on first hit.
  for (const candidate in rewrites) {
    if (url.startsWith(candidate)) {
      url = `${rewrites[candidate]}${stripScheme(url)}`
      break
    }
  }

  const scheme = getScheme(url)

  // We accept all schemes
  if (!allowedSchemes) {
    if (scheme) {
      return url
    }
    return `${BOLT_ROUTING_SCHEME}://${url}`
  }

  if (!scheme && fallbackScheme && allowedSchemes.includes(fallbackScheme)) {
    return `${fallbackScheme}://${url}`
  }

  // Input scheme allowed
  if (allowedSchemes.includes(scheme)) {
    return url
  }

  // Scheme not allowed, can we toggle encryption to allow it?
  if (scheme) {
    const toggledSecurityScheme = toggleSchemeSecurity(url)
    if (allowedSchemes.includes(toggledSecurityScheme)) {
      return `${toggledSecurityScheme}://${stripScheme(url)}`
    }
  }

  // Either no scheme entered or we can't guess an allowed, let's override it with something default
  const defaultScheme =
    fallbackScheme && allowedSchemes.includes(fallbackScheme)
      ? fallbackScheme
      : allowedSchemes[0]
  return `${defaultScheme}://${stripScheme(url)}`
}
