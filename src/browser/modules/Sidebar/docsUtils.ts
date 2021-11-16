import semver from 'semver'
export const formatDocVersion = (v = ''): string => {
  if (!semver.valid(v)) {
    // All non-strings return
    return 'current'
  }
  if (semver.prerelease(v)) {
    return `${semver.major(v)}.${semver.minor(v)}-preview`
  }
  return `${semver.major(v)}.${semver.minor(v)}` || 'current'
}
