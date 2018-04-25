/* global Cypress */

Cypress.config.serverVersion = parseFloat(Cypress.env('server')) || 3.4
