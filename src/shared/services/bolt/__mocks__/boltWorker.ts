import { handleBoltWorkerMessage } from '../handleBoltWorkerMessage'

export default class BoltWorker {
  onmessage = (_msg: any) => {}

  postMessage(msg: any) {
    const postMessageToMainThread = (msg: any) => this.onmessage({ data: msg })
    handleBoltWorkerMessage(postMessageToMainThread)({ data: msg })
  }
}
