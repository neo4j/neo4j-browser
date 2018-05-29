/* global Cypress */

Cypress.config.serverVersion = parseFloat(Cypress.env('server')) || 3.4
Cypress.config.includeImportTests = Cypress.env('include-import-tests') || false
