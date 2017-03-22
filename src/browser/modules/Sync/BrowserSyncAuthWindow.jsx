const BrowserSyncAuthWindow = (url, callback) => {
  const win = window.open(url, 'loginWindow', 'location=0,status=0,scrollbars=0, width=1080,height=720')
  const pollInterval = setInterval(() => {
    win.postMessage('Polling for results', url)
  }, 6000)
  try {
    win.moveTo(500, 300)
  } catch (e) {
    console.log('error')
  }
  window.addEventListener('message', (event) => {
    clearInterval(pollInterval)
    callback(event.data)
    win.close()
  }, false)
}

export default BrowserSyncAuthWindow
