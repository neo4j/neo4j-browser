/* global location */
import bolt from './bolt'
import { getUrlInfo } from 'services/utils'

export const getEncryptionMode = () => {
  return location.protocol === 'https:'
}

export const getDiscoveryEndpoint = () => {
  const info = getUrlInfo(location.href || 'http://localhost:7474/')
  return `${info.protocol}//${info.host}/`
}

export const getServerConfig = () => {
  return bolt.transaction('CALL dbms.queryJmx("org.neo4j:*")')
    .then((res) => {
      // Find kernel conf
      let conf
      res.records.forEach((record) => {
        if (record.get('name').match(/Configuration$/)) conf = record.get('attributes')
      })
      return conf
    }).catch((e) => {
      return null
    })
}
