/* global Cypress */

Cypress.config('serverVersion', parseFloat(Cypress.env('server')) || 3.5)
Cypress.config('serverEdition', Cypress.env('edition') || 'enterprise')

Cypress.config(
  'includeImportTests',
  Cypress.env('include-import-tests') || false
)

// Don't set initial pw on local or aura
Cypress.config(
  'setInitialPassword',
  !['local', 'aura'].includes(Cypress.env('E2E_TEST_ENV'))
)

Cypress.config('url', '/')
Cypress.config('password', Cypress.env('browser-password') || 'newpassword')
Cypress.config(
  'boltHost',
  Cypress.env('bolt-url')
    ? removeUriScheme(Cypress.env('bolt-url')).split(':')[0]
    : 'localhost'
)
Cypress.config(
  'boltPort',
  Cypress.env('bolt-url')
    ? removeUriScheme(Cypress.env('bolt-url')).split(':')[1]
    : 7687
)
Cypress.config(
  'boltUrl',
  Cypress.env('bolt-url')
    ? Cypress.env('bolt-url')
    : 'bolt://' + Cypress.config('boltHost') + ':' + Cypress.config('boltPort')
)

function removeUriScheme(uri = '') {
  const SEPARATOR = '://'
  const [_skip, ...rest] = uri.includes(SEPARATOR)
    ? uri.split(SEPARATOR)
    : [, uri]
  return rest.join(SEPARATOR)
}
