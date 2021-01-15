import { Favorite } from 'shared/modules/favorites/favoritesDuck'

export function getScriptDisplayName(script: Favorite): string {
  const nameLine = script.content.split('\n')[0]
  return nameLine.startsWith('//') ? nameLine.substr(2).trimLeft() : nameLine
}
