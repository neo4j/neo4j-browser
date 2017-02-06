import 'whatwg-fetch'

function get (url) {
  return fetch(url, { // eslint-disable-line
    method: 'get'
  }).then(function (response) {
    return response.text()
  })
}

function getJSON (url) {
  return fetch(url, { // eslint-disable-line
    method: 'get',
    headers: {
      'Content-Type': 'application/json'
    }
  }).then((response) => {
    return response.json()
  }).then((json) => {
    return json
  }).catch((error) => {
    console.error(error)
    return null
  })
}

export default {
  get,
  getJSON
}
