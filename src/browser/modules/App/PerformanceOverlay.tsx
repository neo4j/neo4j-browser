import React, { useEffect, useState } from 'react'
import styled from 'styled-components'
import { connect } from 'react-redux'
import { shouldShowPerfomanceOverlay } from 'shared/modules/settings/settingsDuck'

const Overlay = styled.div`
  width: 250px;
  height: 200px;
  background-color: black;
  color: white;
  position: absolute;
  bottom: 10px;
  right: 10px;
  z-index: 99999999999;
  padding: 10px;
  opacity: 0.95;
`

function perfTracker() {
  let lastTime = performance.now()
  let frames = 0

  return function(onFpsData: (fps: number) => void) {
    frames = frames + 1
    const currentTime = performance.now()
    if (currentTime >= lastTime + 1000) {
      const fps = (frames * 1000) / (currentTime - lastTime)
      onFpsData(fps)
      frames = 0
      lastTime = currentTime
    }
  }
}

type PerformanceOverlayProps = { shouldShow: boolean }

function PerformanceOverlay({
  shouldShow
}: PerformanceOverlayProps): JSX.Element | null {
  useEffect(() => {
    const tick = perfTracker()

    let samples: number[] = []

    let requestId = requestAnimationFrame(function loop() {
      tick((fps: number) => {
        // Avoid using react state to not tie number to reacts re-render cycle
        const fpsCounter = document.getElementById('fps-counter')
        if (fpsCounter) {
          samples = [fps, ...samples]
          const limit = 10
          if (samples.length > limit) {
            samples = samples.slice(0, limit)
          }
          const low = Math.min(...samples)
          const add = (a: number, b: number) => a + b
          const average = samples.reduce(add, 0) / samples.length

          fpsCounter.textContent = `
Current FPS: ${fps.toFixed(2).toString()}
Average in the last minute: ${average.toFixed(2)}
Lowest in last minute: ${low.toFixed(2)}
          `
        }
      })

      requestId = requestAnimationFrame(loop)
    })
    return () => cancelAnimationFrame(requestId)
  }, [])

  return shouldShow ? (
    <Overlay>
      <div style={{ whiteSpace: 'pre' }} id="fps-counter" />
    </Overlay>
  ) : null
}

const mapStateToProps = (state: any) => ({
  shouldShow: shouldShowPerfomanceOverlay(state)
})

export default connect(mapStateToProps)(PerformanceOverlay)
