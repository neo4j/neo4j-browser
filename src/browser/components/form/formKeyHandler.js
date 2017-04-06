export default class FormKeyHandler {
  constructor (submitAction) {
    this.elements = {}
    this.submitAction = submitAction
  }

  initialize () {
    this.elements[1] && this.elements[1].focus()
  }

  registerInput (input, position) {
    if (input) {
      this.elements[position] = input
      input.onkeypress = this.handleKeyPress.bind(this)
    }
  }

  regsiterSubmit (submitAction) {
    this.submitAction = submitAction
  }

  handleKeyPress (e) {
    if (e.keyCode === 13) {
      let currentPosition = null

      for (let key in this.elements) {
        if (this.elements[key] === e.srcElement) {
          currentPosition = key
          break
        }
      }

      if (this.elements[+currentPosition + 1]) {
        this.elements[+currentPosition + 1].focus()
      } else {
        this.submitAction(e)
      }
    }
  }
}
