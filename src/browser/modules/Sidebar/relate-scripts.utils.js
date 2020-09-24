import remote from 'services/remote'
import { SLASH, CYPHER_FILE_EXTENSION } from 'shared/services/export-favorites'
import { pick } from 'lodash-es'
import uuid from 'uuid'

// @todo: Add documentation...

// will be a function once projectId is available
export const getProjectFilesQueryVars = {
  projectId: 'project-03688c10-a811-4c0c-85d4-581e88c2183a',
  filterValue: CYPHER_FILE_EXTENSION
}

export const removeProjectFileMutationVars = filePath => ({
  ...pick(getProjectFilesQueryVars, ['projectId']),
  filePath
})

export const mapRelateFavorites = async ({
  downloadToken,
  name,
  directory
}) => ({
  id: uuid.v4(),
  name,
  path: directory.startsWith('.') ? SLASH : `${SLASH}${directory}`, // @todo: need to look into this
  contents: await getProjectCypherFileContents(downloadToken, name)
})

const getProjectCypherFileContents = (token, name) =>
  remote
    .request('GET', `/files/${token}/${name}`)
    .then(body => body.text())
    .catch(e => console.log('++err', e)) // ?
