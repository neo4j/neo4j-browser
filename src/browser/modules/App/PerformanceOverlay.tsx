import React, { useEffect, useState } from 'react'
import styled from 'styled-components'
import { connect } from 'react-redux'
import { shouldShowPerfomanceOverlay } from 'shared/modules/settings/settingsDuck'

const Overlay = styled.div`
  width: 100px;
  height: 100px;
  background-color: black;
  color: white;
  position: absolute;
  bottom: 10px;
  right: 10px;
  z-index: 99999999999;
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

    let requestId = requestAnimationFrame(function loop() {
      tick((fps: number) => {
        // Avoid using react state to not tie number to reacts re-render cycle
        const fpsCounter = document.getElementById('fps-counter')
        if (fpsCounter) {
          fpsCounter.textContent = fps.toFixed(2).toString()
        }
      })

      requestId = requestAnimationFrame(loop)
    })
    return () => cancelAnimationFrame(requestId)
  }, [])

  return shouldShow ? (
    <Overlay>
      <div id="fps-counter" /> OVERLAY
    </Overlay>
  ) : null
}

const mapStateToProps = (state: any) => ({
  shouldShow: shouldShowPerfomanceOverlay(state)
})

export default connect(mapStateToProps)(PerformanceOverlay)
