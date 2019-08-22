import { useState, useEffect } from 'react'
import { useApolloClient } from '@apollo/react-hooks'
import workspaceQuery from './workspace.graphql'
import workspaceSubscription from './on-workspace-change.graphql'
import { getActiveGraphData } from './relate-api.utils'
import { deepEquals } from 'services/utils'

export function useWorkspaceData () {
  const client = useApolloClient()
  const [workspaceData, setState] = useState(null)
  useEffect(() => {
    async function fetchData () {
      const { data } = await client.query({ query: workspaceQuery })
      setState(data)
    }
    fetchData()
  }, []) // initial load only

  return workspaceData
}

export function useWorkspaceDataOnChange () {
  const client = useApolloClient()
  const [workspaceData, setState] = useState(null)
  useEffect(() => {
    const observer = client.subscribe({ query: workspaceSubscription })
    observer.subscribe({
      next: ({ data }) => {
        setState(data)
      },
      error (err) {
        console.error('err', err)
      }
    })
    return () => observer.unsubscribe()
  }, []) // initial load only

  return workspaceData
}

export function useActiveGraphMonitor () {
  const [activeGraph, setActiveGraph] = useState(undefined)
  const { onWorkspaceChange } = useWorkspaceDataOnChange() || {}
  useEffect(
    () => {
      // Wait until initial data comes back
      if (activeGraph === undefined && !onWorkspaceChange) {
        return
      }
      const latestActiveGraph = getActiveGraphData({
        workspace: onWorkspaceChange
      })
      if (!deepEquals(activeGraph, latestActiveGraph)) {
        setActiveGraph(latestActiveGraph)
      }
    },
    [onWorkspaceChange]
  )
  return activeGraph
}
