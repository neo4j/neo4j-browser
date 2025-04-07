const notOptedOutOfPreview = (): boolean => {
  const prefersOldBrowser = localStorage.getItem('prefersOldBrowser')
  const doesPreferQuery = prefersOldBrowser === 'false'

  return doesPreferQuery || prefersOldBrowser === null
}

export const optedInByLocalhost = (): boolean => {
  console.log('notOptedOutOfPreview', notOptedOutOfPreview())
  console.log('window.location.hostname', window.location.hostname)
  return notOptedOutOfPreview() && window.location.hostname === 'localhost'
}
