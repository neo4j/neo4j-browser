export const getRelativeTimeString = (date: Date | number): string => {
  const now = new Date()
  const then = new Date(date)
  const diff = now.getTime() - then.getTime()
  
  // Convert to relative time
  const rtf = new Intl.RelativeTimeFormat('en', { numeric: 'auto' })
  const seconds = Math.floor(diff / 1000)
  
  if (seconds < 60) return rtf.format(-seconds, 'second')
  const minutes = Math.floor(seconds / 60)
  if (minutes < 60) return rtf.format(-minutes, 'minute')
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return rtf.format(-hours, 'hour')
  const days = Math.floor(hours / 24)
  return rtf.format(-days, 'day')
} 