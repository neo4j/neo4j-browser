import React, { useEffect, useRef } from 'react'
import { connect } from 'react-redux'
import styled from 'styled-components'

import { shouldShowPerformanceOverlay } from 'shared/modules/settings/settingsDuck'

function perfTracker() {
  let lastTime = performance.now()
  let frames = 0

  return function (onFpsData: (fps: number) => void) {
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
  const samples = useRef<number[]>([])
  const limit = 100

  useEffect(() => {
    if (shouldShow) {
      const tick = perfTracker()

      let requestId = requestAnimationFrame(function loop() {
        tick((fps: number) => {
          updateStats('fps', fps)

          samples.current = [fps, ...samples.current]
          if (samples.current.length > limit) {
            samples.current = samples.current.slice(0, limit)
          }
          updateStats('minFps', Math.min(...samples.current))

          const add = (a: number, b: number) => a + b
          updateStats(
            'meanFps',
            samples.current.reduce(add, 0) / samples.current.length
          )

          const memory: { usedJSHeapSize: number; jsHeapSizeLimit: number } =
            // @ts-ignore chrome only field
            performance.memory

          if (memory) {
            const { usedJSHeapSize, jsHeapSizeLimit } = memory
            const percentageMemoryUsed = `${(
              100 *
              (usedJSHeapSize / jsHeapSizeLimit)
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
    } else {
      return undefined
    }
  }, [shouldShow])

  function dumpStats() {
    console.log(['fps', ...samples.current].join('\n'))
  }

  return shouldShow ? (
    <Overlay>
      {['fps', 'meanFps', 'minFps', 'memUsage', 'percentOfTotalMemUsed'].map(
        metric => (
          <FlexContainer key={metric}>
            <Label>{metric}</Label> <span id={metric}> - </span>
          </FlexContainer>
        )
      )}
      <DumpButton onClick={dumpStats}>
        Dump last {limit} fps samples in console
      </DumpButton>
    </Overlay>
  ) : null
}

const FlexContainer = styled.div`
  display: flex;
`
const Label = styled.div`
  width: 200px;
  text-align: right;
  font-weight: 600;
  margin-right: 10px;
`
const DumpButton = styled.button`
  background-color: white;
  color: black;
  margin-left: 50px;
  margin-top: 20px;
  padding: 1px;
  border: none;
  border-radius: 2px;
`

const Overlay = styled.div`
  width: 23em;
  background-color: rgba(28, 28, 28, 0.8);
  color: #fff;
  position: absolute;
  bottom: 10px;
  right: 10px;
  z-index: 9999999999;
  padding: 10px;
`

const mapStateToProps = (state: any) => ({
  shouldShow: shouldShowPerformanceOverlay(state)
})

export default connect(mapStateToProps)(PerformanceOverlay)
