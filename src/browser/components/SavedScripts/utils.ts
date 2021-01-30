import { Favorite } from 'shared/modules/favorites/favoritesDuck'

export function getScriptDisplayName(script: Favorite): string {
  return defaultNameFromDisplayContent(script.content)
}

export function defaultNameFromDisplayContent(content: string): string {
  const nameLine = content.split('\n')[0]
  return nameLine.startsWith('//') ? nameLine.substr(2).trimLeft() : nameLine
}
