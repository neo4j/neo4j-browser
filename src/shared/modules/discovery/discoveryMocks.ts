/*
 * Copyright (c) "Neo4j"
 * Neo4j Sweden AB [http://neo4j.com]
 *
 * This file is part of Neo4j.
 *
 * Neo4j is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */

type FakeDiscoveryParams = {
  providerIds?: string[]
  host?: string
  neo4jEdition?: 'enterprise' | 'community'
  neo4jVersion?: string
}
export const fakeDiscoveryResponse = ({
  providerIds = [],
  host,
  neo4jVersion = '4.4.0',
  neo4jEdition = 'enterprise'
}: FakeDiscoveryParams): any => ({
  ...(host
    ? {
        bolt_routing: host,
        bolt_direct: host,
        neo4j_version: neo4jVersion,
        neo4j_edition: neo4jEdition
      }
    : {}),
  auth_config: {
    oidc_providers: providerIds.map(createSSOProvider4dot4Format)
  }
})

export const createSSOProvider4dot4Format = (id: string) => ({
  id,
  name: 'Okta',
  auth_flow: 'pkce',
  auth_endpoint: 'https://dev.okta.com/oauth2/default/v1/authorize',
  well_known_discovery_uri:
    'https://dev.okta.com/oauth2/default/.well-known/openid-configuration',
  redirect_uri: 'http://localhost:8085?idp_id=okta-oidc',
  params: {
    client_id: 'cxkvjcvkxlcjbvl',
    response_type: 'code',
    scope: 'openid profile email groups'
  }
})

export const exampleSSOProviderMinimal = {
  id: 'okta-oidc',
  name: 'Okta',
  auth_flow: 'pkce',
  auth_endpoint: 'https://dev.okta.com/oauth2/default/v1/authorize',
  well_known_discovery_uri:
    'https://dev.okta.com/oauth2/default/.well-known/openid-configuration',
  params: {
    client_id: 'cxkvjcvkxlcjbvl',
    redirect_uri: 'http://localhost:8085?idp_id=okta-oidc',
    response_type: 'code',
    scope: 'openid profile email groups'
  }
}

export const exampleSSOProvider = {
  id: 'okta-oidc',
  name: 'Okta',
  auth_flow: 'pkce',
  auth_endpoint: 'https://dev.okta.com/oauth2/default/v1/authorize',
  well_known_discovery_uri:
    'https://dev.okta.com/oauth2/default/.well-known/openid-configuration',
  params: {
    client_id: 'cxkvjcvkxlcjbvl',
    response_type: 'code',
    redirect_uri: 'http://localhost:8085?idp_id=okta-oidc',
    scope: 'openid profile email groups'
  },
  config: {
    implicit_flow_requires_nonce: false,
    token_type_principal: 'id_token',
    token_type_authentication: 'access_token',
    principal: 'sub'
  }
}

export const SSOProvider4dot4Format = {
  bolt_routing: 'neo4j://localhost:7687',
  transaction: 'http://localhost:7474/db/{databaseName}/tx',
  bolt_direct: 'bolt://localhost:7687',
  neo4j_version: '4.4.0-dev',
  neo4j_edition: 'enterprise',
  auth_config: {
    oidc_providers: [
      {
        auth_endpoint:
          'https://login.microsoftonline.com/555ee7dd-5526-4b3d-a35f-b85263b114e7/oauth2/v2.0/authorize',
        well_known_discovery_uri:
          'https://login.microsoftonline.com/555ee7dd-5526-4b3d-a35f-b85263b114e7/v2.0/.well-known/openid-configuration',
        auth_flow: 'pkce',
        id: 'azure-oidc3',
        redirect_uri: 'http://localhost:8085?idp_id=okta-oidc',
        token_endpoint:
          'https://login.microsoftonline.com/555ee7dd-5526-4b3d-a35f-b85263b114e7/oauth2/v2.0/token'
      }
    ]
  }
}

export const exampleSSOProviderFull = {
  id: 'okta-oidc',
  name: 'Okta',
  auth_flow: 'pkce',
  auth_endpoint: 'https://dev.okta.com/oauth2/default/v1/authorize',
  token_endpoint: 'https://dev.okta.com/oauth2/default/v1/token',
  well_known_discovery_uri:
    'https://dev.okta.com/oauth2/default/.well-known/openid-configuration',
  params: {
    client_id: 'cxkvjcvkxlcjbvl',
    redirect_uri: 'http://localhost:8085?idp_id=okta-oidc',
    response_type: 'code',
    scope: 'openid profile email groups'
  },
  auth_params: {
    client_secret: 'jsfsdhfhskfjsdfksdkljfljksf',
    test: 'arg'
  },
  token_params: {
    arg: 'test'
  },
  config: {
    implicit_flow_requires_nonce: false,
    token_type_principal: 'id_token',
    token_type_authentication: 'access_token',
    principal: 'sub',
    code_challenge_method: 'S256'
  }
}
