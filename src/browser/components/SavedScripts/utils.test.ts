import {
  addScriptPathPrefix,
  getEmptyFolderDefaultPath,
  getRootLevelFolder,
  getScriptDisplayName,
  getSubLevelFolders,
  omitScriptPathPrefix,
  sortAndGroupScriptsByPath
} from './utils'

describe('saved-scripts.utils', () => {
  describe('getScriptDisplayName', () => {
    const scriptNoNameNoCommentSingleLine = {
      contents: 'Foo bar',
      path: 'apa'
    }
    const scriptNoNameNoCommentMultiLine = {
      contents: 'Foo bar\nBar baz',
      path: 'apa'
    }
    const scriptNoNameWithComment = {
      contents: '//Comment\nBar baz',
      path: 'apa'
    }
    const scriptNoNameWithCommentWhiteSpace = {
      contents: '//   Comment\nBar baz',
      path: 'apa'
    }
    const scriptWithNameNoComment = {
      name: 'Apa',
      contents: 'Bar baz',
      path: 'apa'
    }
    const scriptWithNameAndComment = {
      name: 'Apa',
      contents: '//donkey\nBar baz',
      path: 'apa'
    }

    test('Uses content as name when nothing else available', () => {
      expect(getScriptDisplayName(scriptNoNameNoCommentSingleLine)).toBe(
        'Foo bar'
      )
    })

    test('Uses only first line of content', () => {
      expect(getScriptDisplayName(scriptNoNameNoCommentMultiLine)).toBe(
        'Foo bar'
      )
    })

    test('Uses comment as name when available', () => {
      expect(getScriptDisplayName(scriptNoNameWithComment)).toBe('Comment')
    })

    test('Uses comment as name when available, stripping leading whitespace', () => {
      expect(getScriptDisplayName(scriptNoNameWithCommentWhiteSpace)).toBe(
        'Comment'
      )
    })

    test('Uses name as name when available', () => {
      expect(getScriptDisplayName(scriptWithNameNoComment)).toBe('Apa')
    })

    test('Uses name as name even when comment is available', () => {
      expect(getScriptDisplayName(scriptWithNameAndComment)).toBe('Apa')
    })
  })

  describe('sortAndGroupScriptsByPath', () => {
    const scripts = [
      { path: '/' },
      { path: '/foo' },
      { path: '/bar' },
      { path: '/foo/baz' }
    ]

    test('sorts scripts in ascending order by path', () => {
      // @ts-ignore
      expect(sortAndGroupScriptsByPath('/', scripts)).toEqual([
        ['/', [{ path: '/' }]],
        ['/bar', [{ path: '/bar' }]],
        ['/foo', [{ path: '/foo' }]],
        ['/foo/baz', [{ path: '/foo/baz' }]]
      ])
    })

    test('Omits scripts not in provided namespace', () => {
      // @ts-ignore
      expect(sortAndGroupScriptsByPath('/foo', scripts)).toEqual([
        ['/foo', [{ path: '/foo' }]],
        ['/foo/baz', [{ path: '/foo/baz' }]]
      ])
    })
  })

  describe('omitScriptPathPrefix', () => {
    test('omits prefix from path if present', () => {
      expect(omitScriptPathPrefix('/foo', '/foo/bar/baz')).toBe('/bar/baz')
    })

    test('returns path untouched when prefix not present', () => {
      expect(omitScriptPathPrefix('/apa', '/foo/bar/baz')).toBe('/foo/bar/baz')
    })
  })

  describe('addScriptPathPrefix', () => {
    test('adds prefix to path if present', () => {
      expect(addScriptPathPrefix('/foo', '/bar/baz')).toBe('/foo/bar/baz')
    })

    test('returns path untouched when prefix already present', () => {
      expect(addScriptPathPrefix('/foo', '/foo/bar/baz')).toBe('/foo/bar/baz')
    })
  })

  describe('getRootLevelFolder', () => {
    const namespace = '/foo'
    const scripts = [{ path: '/foo' }, { path: '/foo/baz' }]
    // @ts-ignore
    const folders = sortAndGroupScriptsByPath(namespace, scripts)

    test('Returns only root level folder', () => {
      expect(getRootLevelFolder(namespace, folders)).toEqual([
        namespace,
        [{ path: '/foo' }]
      ])
    })

    test('Returns empty folder when none found', () => {
      expect(getRootLevelFolder('/bar', folders)).toEqual(['/bar', []])
    })
  })

  describe('getSubLevelFolders', () => {
    const namespace = '/foo'
    const scripts = [
      { path: '/foo' },
      { path: '/foo/baz' },
      { path: '/foo/bam' }
    ]
    // @ts-ignore
    const folders = sortAndGroupScriptsByPath(namespace, scripts)

    test('Returns only sub level folders', () => {
      expect(getSubLevelFolders(namespace, folders)).toEqual([
        ['/foo/bam', [{ path: '/foo/bam' }]],
        ['/foo/baz', [{ path: '/foo/baz' }]]
      ])
    })
  })

  describe('getEmptyFolderDefaultPath', () => {
    const namespace = '/foo/'

    test('Generates default path when no folders exists', () => {
      expect(getEmptyFolderDefaultPath(namespace, [])).toBe('/foo/New Folder')
    })

    test('Generates default path when no folders with same path exists', () => {
      expect(getEmptyFolderDefaultPath(namespace, ['/foo/bar'])).toBe(
        '/foo/New Folder'
      )
    })

    test('Generates default path with numerical suffix when folder with same path exists', () => {
      expect(
        getEmptyFolderDefaultPath(namespace, ['/foo/New Folder', '/foo/bar'])
      ).toBe('/foo/New Folder 1')
    })

    test('Generates default path with sufficiently incremented numerical suffix when folder with same path and suffix exists', () => {
      expect(
        getEmptyFolderDefaultPath(namespace, [
          '/foo/New Folder',
          '/foo/bar',
          '/foo/New Folder 4'
        ])
      ).toBe('/foo/New Folder 5')
    })
  })
})
