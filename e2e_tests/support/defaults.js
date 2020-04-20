/* global Cypress */

Cypress.config('serverVersion', parseFloat(Cypress.env('server')) || 3.5)
Cypress.config('serverEdition', Cypress.env('edition') || 'enterprise')
Cypress.config('serverPlatform', Cypress.env('platform') || null)

Cypress.config(
  'includeImportTests',
  Cypress.env('include-import-tests') || false
)
Cypress.config('url', '/')
Cypress.config('password', Cypress.env('browser-password') || 'newpassword')
Cypress.config(
  'boltHost',
  Cypress.env('bolt-url') ? Cypress.env('bolt-url').split(':')[0] : 'localhost'
)
Cypress.config(
  'boltPort',
  Cypress.env('bolt-url') ? Cypress.env('bolt-url').split(':')[1] : 7687
)
Cypress.config(
  'boltUrl',
  'bolt://' +
    (Cypress.env('bolt-url')
      ? Cypress.env('bolt-url')
      : Cypress.config('boltHost') + ':' + Cypress.config('boltPort'))
)
Cypress.config(
  'neo4jUrl',
  'neo4j://' +
    (Cypress.env('bolt-url')
      ? Cypress.env('bolt-url')
      : Cypress.config('boltHost') + ':' + Cypress.config('boltPort'))
)
