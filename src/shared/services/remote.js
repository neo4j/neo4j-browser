import 'whatwg-fetch'

function get (url) {
  return fetch(url, { // eslint-disable-line
    method: 'get'
  }).then(function (response) {
    return response.text()
  })
}

export default {
  get
}
