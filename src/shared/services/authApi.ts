import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'
import type { AuthenticationMethod } from 'shared/types/auth'
import type { FetchBaseQueryError } from '@reduxjs/toolkit/query'

interface Credentials {
  host: string
  username?: string
  password?: string
  authenticationMethod: AuthenticationMethod
  encrypted?: boolean
}

interface AuthResponse {
  success: boolean
  error?: string
  token?: string
  authUrl?: string
  requiresPasswordChange?: boolean
  SSOProviders?: Array<{
    id: string
    name: string
    authUrl: string
  }>
}

export const authApi = createApi({
  reducerPath: 'authApi',
  baseQuery: fetchBaseQuery({ 
    baseUrl: '/api',
    credentials: 'include',
  }),
  endpoints: (builder) => ({
    connect: builder.mutation<AuthResponse, Credentials>({
      query: (credentials) => ({
        url: '/connect',
        method: 'POST',
        body: credentials,
        headers: {
          'Content-Type': 'application/json',
          'X-CSRF-Token': document.cookie.match(/csrf-token=([^;]+)/)?.[1] || ''
        }
      })
    }),
    verifyCredentials: builder.mutation<AuthResponse, Credentials>({
      query: (credentials) => ({
        url: '/verify-credentials',
        method: 'POST',
        body: credentials
      })
    }),
    getSSOProviders: builder.query<AuthResponse, string>({
      query: (host) => `/sso-providers?host=${encodeURIComponent(host)}`
    }),
    logout: builder.mutation<void, void>({
      query: () => ({
        url: '/logout',
        method: 'POST'
      })
    }),
    ssoLogin: builder.mutation<AuthResponse, void>({
      query: () => ({
        url: '/sso/login',
        method: 'POST'
      }),
      async onQueryStarted(_, { queryFulfilled }) {
        try {
          const { data } = await queryFulfilled
          if (data.success) {
            window.location.href = data.authUrl || '/'
          }
        } catch (err) {
          console.error('SSO login failed:', err)
        }
      }
    })
  })
})

export const {
  useConnectMutation,
  useVerifyCredentialsMutation,
  useGetSSOProvidersQuery,
  useLogoutMutation,
  useSsoLoginMutation
} = authApi 