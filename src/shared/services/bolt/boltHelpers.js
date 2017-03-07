/* global location */

export const getEncryptionMode = () => {
  return location.protocol === 'https:'
}

export const getDiscoveryEndpoint = () => {
  return `//${location.host}/`
}
