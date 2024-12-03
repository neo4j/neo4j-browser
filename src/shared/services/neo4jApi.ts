import { createApi, fetchBaseQuery, BaseQueryFn } from '@reduxjs/toolkit/query/react'

interface Query {
  queryId: string
  query: string
  parameters: Record<string, unknown>
  host: string
  elapsedTimeMillis?: number
  requestId?: string
}

export const neo4jApi = createApi({
  reducerPath: 'neo4jApi',
  baseQuery: fetchBaseQuery({ baseUrl: '/api' }) as BaseQueryFn,
  endpoints: (builder) => ({
    listQueries: builder.query<Query[], void>({
      query: () => 'queries',
      keepUnusedDataFor: 20
    }),
    killQuery: builder.mutation<void, { queryId: string }>({
      query: ({ queryId }) => ({
        url: `queries/${queryId}`,
        method: 'DELETE'
      })
    })
  })
})

export const { 
  useListQueriesQuery, 
  useKillQueryMutation,
  usePrefetch: usePrefetchQueries 
} = neo4jApi 