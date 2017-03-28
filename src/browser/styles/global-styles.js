import { injectGlobal } from 'styled-components'

injectGlobal`
  pre {
    max-width: 100%;
    white-space: pre;
    word-wrap: normal;
    word-break: normal;
    overflow: auto;
  }

  .code-style,
  .CodeMirror {
    font-family: "Inconsolata", Monaco,"Courier New",Terminal,monospace !important;
    font-size: 16px !important;
    line-height: 23px !important;
    -webkit-font-smoothing: initial !important;
    cursor: text !important;
  }

  .CodeMirror.cm-s-neo,
  .CodeMirror.cm-s-css {
    color: #2e383c !important;
  }

  .CodeMirror.cm-s-neo .cm-comment,
  .CodeMirror.cm-s-css .cm-comment {
    color: #c0c4ca !important;
  }

  .CodeMirror.cm-s-neo .cm-keyword,
  .CodeMirror.cm-s-css .cm-keyword,
  .CodeMirror.cm-s-neo .cm-property,
  .CodeMirror.cm-s-css .cm-property {
    color: #3498db !important;
  }

  .CodeMirror.cm-s-neo .cm-atom,
  .CodeMirror.cm-s-css .cm-atom,
  .CodeMirror.cm-s-neo .cm-number,
  .CodeMirror.cm-s-css .cm-number {
    color: #9b59b6 !important;
  }

  .CodeMirror.cm-s-neo .cm-node,
  .CodeMirror.cm-s-css .cm-node,
  .CodeMirror.cm-s-neo .cm-tag,
  .CodeMirror.cm-s-css .cm-tag {
    color: #e74c3c !important;
  }

  .CodeMirror.cm-s-neo .cm-string,
  .CodeMirror.cm-s-css .cm-string {
    color: #e67e22 !important;
  }

  .CodeMirror.cm-s-neo .cm-variable,
  .CodeMirror.cm-s-css .cm-variable,
  .CodeMirror.cm-s-neo .cm-qualifier,
  .CodeMirror.cm-s-css .cm-qualifier {
    color: #1abc9c !important;
  }

  #grass .CodeMirror {
    font-size: 14px !important;
    line-height: 18px !important;
  }

  #editor.file-loaded .CodeMirror {
    margin-right: 12px !important;
  }

  .CodeMirror {
    background-color: #fff !important;
    padding: 12px !important;
    border-radius: 4px !important;
    transist: all !important;
  }

  .CodeMirror pre {
    padding: 0 !important;
  }

  .CodeMirror .CodeMirror-placeholder {
    color: #e0e2e6 !important;
  }

  .CodeMirror-lines {
    padding: 0 !important;
  }

  .CodeMirror-gutters {
    border: none !important;
    border-right: 10px solid transparent !important;
    background-color: transparent !important;
  }

  .CodeMirror-linenumber {
    padding: 0 !important;
    color: #e0e2e5 !important;
    opacity: 1 !important;
  }

  .CodeMirror {
    height: auto !important;
  }

  .CodeMirror-scroll {
    overflow: hidden !important;
    max-height: 140px !important;
  }

  .CodeMirror div.CodeMirror-cursor {
    border-left: 11px solid rgba(155,157,162,0.37) !important;
    z-index: 3 !important;
  }

  .CodeMirror-sizer {
    transist: min-height !important;
  }

  .CodeMirror-scroll div:nth-child(2) {
    transist: top !important;
  }

  .prompt {
    absolute: top 24px left 46px !important;
    color: #93969b !important;
    opacity: 0 !important;
    z-index: 100 !important;
  }

  .one-line .prompt {
    opacity: 1 !important;
  }

  .one-line .CodeMirror .CodeMirror-linenumber {
    opacity: 0 !important;
  }

  .disable-highlighting .CodeMirror .CodeMirror-code * {
    color: #7b7f89 !important;
  }

  .cypher-hints {
    width: 0.8em !important;
  }

  .gutter-warning {
    color: #FFA500 !important;
    opacity: .6 !important;
    font-size: 14px !important;
    line-height: 23px !important;
    display: inherit !important;
    cursor: pointer
  }

`
