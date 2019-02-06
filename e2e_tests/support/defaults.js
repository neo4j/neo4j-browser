/* global Cypress */

Cypress.config('serverVersion', parseFloat(Cypress.env('server')) || 3.5)
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
