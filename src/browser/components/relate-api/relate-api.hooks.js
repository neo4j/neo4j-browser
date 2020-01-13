import { useState, useEffect } from 'react'
import { useApolloClient } from '@apollo/react-hooks'
import workspaceQuery from './workspace.graphql'
import workspaceSubscription from './on-workspace-change.graphql'
import { getActiveGraphData, getPrefersColorScheme } from './relate-api.utils'
import { deepEquals } from 'services/utils'

export function useWorkspaceData() {
  let client
  // We might not be in a GraphQL env
  try {
    client = useApolloClient()
  } catch (e) {}
  const [workspaceData, setState] = useState(null)
  useEffect(() => {
    async function fetchData() {
      if (!client) {
        return
      }
      const { data } = await client.query({ query: workspaceQuery })
      setState(data)
    }
    fetchData()
  }, []) // initial load only

  return workspaceData
}

export function useWorkspaceDataOnChange() {
  let client
  // We might not be in a GraphQL env
  try {
    client = useApolloClient()
  } catch (e) {}
  const [workspaceData, setState] = useState(null)
  useEffect(() => {
    if (!client) {
      return
    }
    const observer = client.subscribe({ query: workspaceSubscription })
    observer.subscribe({
      next: ({ data }) => {
        setState(data)
      },
      error(err) {
        console.error('err', err)
      }
    })
    return () => observer.unsubscribe()
  }, []) // initial load only

  return workspaceData
}

export function useActiveGraphMonitor(onWorkspaceChangeData) {
  const [activeGraph, setActiveGraph] = useState(undefined)
  useEffect(() => {
    // Wait until initial data comes back
    if (activeGraph === undefined && !onWorkspaceChangeData) {
      return
    }
    const latestActiveGraph = getActiveGraphData({
      workspace: onWorkspaceChangeData.onWorkspaceChange
    })
    if (!deepEquals(activeGraph, latestActiveGraph)) {
      setActiveGraph(latestActiveGraph)
    }
  }, [onWorkspaceChangeData])
  return activeGraph
}

export function usePrefersColorSchemeMonitor(onWorkspaceChangeData) {
  const [prefersColorScheme, setPrefersColorScheme] = useState(undefined)
  useEffect(() => {
    // Wait until initial data comes back
    if (prefersColorScheme === undefined && !onWorkspaceChangeData) {
      return
    }
    const latestPrefersColorScheme = getPrefersColorScheme(
      onWorkspaceChangeData
    )
    if (prefersColorScheme !== latestPrefersColorScheme) {
      setPrefersColorScheme(latestPrefersColorScheme)
    }
  }, [onWorkspaceChangeData])
  return prefersColorScheme
}
