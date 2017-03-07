/* global location */

export const getEncryptionMode = () => {
  return location.protocol === 'https:'
}
