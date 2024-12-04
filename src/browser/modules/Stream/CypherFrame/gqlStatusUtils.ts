import { capitalize, isNonEmptyString } from 'shared/utils/strings'

const gqlStatusIndexes = {
  title: 1,
  description: 2
}

const formatPropertyFromStatusDescripton = (
  index: number,
  gqlStatusDescription?: string
): string | undefined => {
  const matches =
    gqlStatusDescription?.match(
      /^(?:error|info|warn):\s(.+?)(?:\.(.+?))?\.?$/
    ) ?? []

  return matches[index] === undefined
    ? undefined
    : capitalize(matches[index].trim())
}

export const formatTitleFromGqlStatusDescription = (
  gqlStatusDescription?: string
): string => {
  return (
    formatPropertyFromStatusDescripton(
      gqlStatusIndexes.title,
      gqlStatusDescription
    )?.trim() ?? ''
  )
}

export const formatDescriptionFromGqlStatusDescription = (
  gqlStatusDescription?: string
): string => {
  const description =
    formatPropertyFromStatusDescripton(
      gqlStatusIndexes.description,
      gqlStatusDescription
    )?.trim() ?? ''

  return isNonEmptyString(description) && !description.endsWith('.')
    ? `${description}.`
    : description
}
