/* global location */

export const getEncryptionMode = () => {
  return location.protocol === 'https:'
}

export const getDiscoveryEndpoint = () => {
  const host = location.host ? `//${location.host}/` : 'http://localhost:7474/'
  return host
}
