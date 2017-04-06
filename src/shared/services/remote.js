import fetch from 'isomorphic-fetch'

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
  }).catch((e) => {
    return e
  })
}

export default {
  get,
  getJSON
}
