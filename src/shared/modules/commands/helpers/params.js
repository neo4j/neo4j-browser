import { extractCommandParameters, parseCommandJSON } from 'services/commandUtils'
import { merge, set } from 'shared/modules/params/paramsDuck'

export const handleParamCommand = (action, cmdchar, put, store) => {
  const res = extractCommandParameters(`${cmdchar}param`, action.cmd)
  if (!res) return { success: false, params: {} }
  put(merge(res))
  return {success: true, params: res}
}

export const handleParamsCommand = (action, cmdchar, put, store) => {
  const res = parseCommandJSON(`${cmdchar}params`, action.cmd)
  if (!res) return { success: false }
  put(set(res))
  return {success: true}
}
