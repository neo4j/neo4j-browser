import { getRandomWords } from './utils'

describe('getRandomWords', () => {
  test('gives list of random words', () => {
    const oneWord = getRandomWords(1)
    const threeWords = getRandomWords(3)

    expect(getRandomWords(0)).toEqual([])
    expect(oneWord.length).toEqual(1)
    expect(oneWord[0].length).toBeGreaterThan(2)
    expect(threeWords.length).toEqual(3)
    threeWords.forEach(word => expect(word.length).toBeGreaterThan(2))
  })
})
