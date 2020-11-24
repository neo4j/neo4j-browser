import React, { useEffect } from 'react'
import { connect } from 'react-redux'
import { shouldShowPerfomanceOverlay } from 'shared/modules/settings/settingsDuck'
import styled from 'styled-components'

const Overlay = styled.div`
  width: 23em;
  background-color: rgba(28, 28, 28, 0.8);
  color: #fff;
  position: absolute;
  bottom: 10px;
  right: 10px;
  z-index: 99999999999;
  padding: 10px;
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

function updateStats(name: Metric, value: string | number) {
  const ref = document.getElementById(name)
  if (ref) {
    ref.textContent =
      typeof value === 'string' ? value : value.toFixed(2).toString()
  }
}

type PerformanceOverlayProps = { shouldShow: boolean }
type Metric =
  | 'memUsage'
  | 'percentOfTotalMemUsed'
  | 'minFps'
  | 'meanFps'
  | 'fps'

function PerformanceOverlay({
  shouldShow
}: PerformanceOverlayProps): JSX.Element | null {
  useEffect(() => {
    const tick = perfTracker()

    let samples: number[] = []

    let requestId = requestAnimationFrame(function loop() {
      tick((fps: number) => {
        updateStats('fps', fps)

        samples = [fps, ...samples]
        const limit = 10
        if (samples.length > limit) {
          samples = samples.slice(0, limit)
        }
        updateStats('minFps', Math.min(...samples))

        const add = (a: number, b: number) => a + b
        updateStats('meanFps', samples.reduce(add, 0) / samples.length)

        const memory: { usedJSHeapSize: number; jsHeapSizeLimit: number } =
          // @ts-ignore chrome only field
          performance.memory

        if (memory) {
          const { usedJSHeapSize, jsHeapSizeLimit } = memory
          const percentageMemoryUsed = `${(
            (100 * usedJSHeapSize) /
            jsHeapSizeLimit
          ).toFixed(2)}%`
          updateStats('percentOfTotalMemUsed', percentageMemoryUsed)

          const bytesInMegaByte = 1048576
          const MBused = usedJSHeapSize / bytesInMegaByte
          updateStats('memUsage', `${MBused.toFixed(2)}MB`)
        }
      })

      requestId = requestAnimationFrame(loop)
    })
    return () => cancelAnimationFrame(requestId)
  }, [])

  return shouldShow ? (
    <Overlay>
      {['fps', 'meanFps', 'minFps', 'memUsage', 'percentOfTotalMemUsed'].map(
        metric => (
          <div key={metric} style={{ display: 'flex' }}>
            <Label>{metric}</Label> <span id={metric}> - </span>
          </div>
        )
      )}
    </Overlay>
  ) : null
}

const Label = styled.div`
  width: 200px;
  text-align: right;
  font-weight: 600;
  margin-right: 10px;
`

const mapStateToProps = (state: any) => ({
  shouldShow: shouldShowPerfomanceOverlay(state)
})

export default connect(mapStateToProps)(PerformanceOverlay)
