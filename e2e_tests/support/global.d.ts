/// <reference types="cypress" />

export {}
declare global {
  namespace Cypress {
    interface Chainable {
      /**
       * Custom command to connect to neo4j database
       */
      connect(
        username: string,
        password: string,
        boltUrl?: string,
        makeAssertions?: boolean
      ): Cypress.Chainable<void>
      /**
       * Custom command to run cy.connect if needed
       */
      ensureConnection(creds?: {
        username: string
        password: string
      }): Cypress.Chainable<void>
      /**
       * Custom command to disconnect from neo4j database
       */
      disconnect(): Cypress.Chainable<void>
      setInitialPassword(
        newPassword: string,
        initialPassword?: string,
        username?: string,
        boltUrl?: string,
        force?: boolean
      ): Cypress.Chainable<void>
      /**
       * Custom command to type a command in a frame
       */
      typeInFrame(cmd: string, frameIndex?: number): Cypress.Chainable<void>
      /**
       * Custom command to type and submit query in cypher editor.
       * @example cy.executeCommand(':clear')
       */
      executeCommand(
        query: string,
        options?: Partial<Cypress.TypeOptions>
      ): Cypress.Chainable<void>
      waitForCommandResult(): Cypress.Chainable<void>
      /**
       * Custom command to create a database and wait for it to come online
       */
      createDatabase(dbName: string): Cypress.Chainable<void>
      /**
       * Custom command for testing content of frame
       */
      resultContains(str: string): Cypress.Chainable<boolean>
      /**
       * Custom command for creating user on currently connected database
       */
      createUser(
        username: string,
        password: string,
        forceChangePw: boolean
      ): Cypress.Chainable<void>
      /**
       * Custom command for creating user on currently connected database with specific role
       */
      addUser(
        username: string,
        password: string,
        role: string,
        forceChangePw: boolean
      ): Cypress.Chainable<void>
      /**
       * Custom command for dropping user on currently connected database
       */
      dropUser(username: string): Cypress.Chainable<void>
      getEditor(): Cypress.Chainable<JQuery<HTMLElement>>
      getFrames(): Cypress.Chainable<JQuery<HTMLElement>>
      getPrevInFrameStackBtn(): Cypress.Chainable<JQuery<HTMLElement>>
      getNextInFrameStackBtn(): Cypress.Chainable<JQuery<HTMLElement>>
      enableMultiStatement(): Cypress.Chainable<void>
      disableMultiStatement(): Cypress.Chainable<void>
    }
    interface Cypress {
      config(
        config:
          | 'baseUrl'
          | 'boltHost'
          | 'boltPort'
          | 'boltUrl'
          | 'host'
          | 'password'
          | 'serverEdition'
          | 'url'
      ): string
      config(
        config:
          | 'boltHost'
          | 'boltPort'
          | 'boltUrl'
          | 'host'
          | 'password'
          | 'serverEdition'
          | 'url',
        value: string
      ): void
      config(config: 'serverVersion'): number
      config(config: 'serverVersion', value: number): void
      config(config: 'includeImportTests' | 'setInitialPassword'): boolean
      config(
        config: 'includeImportTests' | 'setInitialPassword',
        value: boolean
      ): void
      runner: {
        stop(): void
      }
    }
  }
  interface Window {
    neo4jDesktopApi: unknown
    Canny?: { (command: string, options?: unknown): void }
    IsCannyLoaded?: boolean
    attachEvent?: typeof window.addEventListener
  }
}
