import words from './words'

export function getRandomWords(count: number): string[] {
  return Array.from({ length: count }).map(
    () => words[Math.floor(Math.random() * words.length)]
  )
}
