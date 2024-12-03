import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'

export interface Query {
  host: string
  queryId: string
  query: string
  parameters: Record<string, unknown>
  elapsedTimeMillis: number
  requestId?: string
}

export const neo4jApi = createApi({
  reducerPath: 'neo4jApi',
  baseQuery: fetchBaseQuery({ baseUrl: '/' }),
  endpoints: (builder) => ({
    listQueries: builder.query<Query[], void>({
      query: () => ({
        url: 'db/manage/queries',
        method: 'POST',
        body: {
          query: 'CALL dbms.listQueries()',
          queryType: 'system'
        }
      }),
      transformResponse: (response: any) => 
        response.result.records.map(({ host, _fields }: any) => ({
          host,
          ...(_fields[0] || {})
        }))
    }),
    killQuery: builder.mutation<void, { queryId: string }>({
      query: ({ queryId }) => ({
        url: 'db/manage/kill-query',
        method: 'POST',
        body: {
          query: 'CALL dbms.killQuery($id)',
          parameters: { id: queryId },
          queryType: 'system'
        }
      })
    })
  })
})

export const { 
  useListQueriesQuery,
  useKillQueryMutation
} = neo4jApi 