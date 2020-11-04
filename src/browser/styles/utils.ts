export const hexToRgba = (hex: any, opacity = 1) => {
  const localHex = hex.replace(
    /^#?([a-f\d])([a-f\d])([a-f\d])$/i,
    (_m: any, r: any, g: any, b: any) => r + r + g + g + b + b
  )
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(localHex)
  return result
    ? `rgba(${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(
        result[3],
        16
      )}, ${opacity})`
    : ''
}
