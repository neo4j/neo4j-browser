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
    font-family: Monaco,"Courier New",Terminal,monospace;
    font-size: 16px;
    line-height: 23px;
    -webkit-font-smoothing: initial;
    cursor: text;
  }

  .CodeMirror.cm-s-neo,
  .CodeMirror.cm-s-css {
    color: #2e383c;
  }

  .CodeMirror.cm-s-neo .cm-comment,
  .CodeMirror.cm-s-css .cm-comment {
    color: #c0c4ca;
  }

  .CodeMirror.cm-s-neo .cm-keyword,
  .CodeMirror.cm-s-css .cm-keyword,
  .CodeMirror.cm-s-neo .cm-property,
  .CodeMirror.cm-s-css .cm-property {
    color: #3498db;
  }

  .CodeMirror.cm-s-neo .cm-atom,
  .CodeMirror.cm-s-css .cm-atom,
  .CodeMirror.cm-s-neo .cm-number,
  .CodeMirror.cm-s-css .cm-number {
    color: #9b59b6;
  }

  .CodeMirror.cm-s-neo .cm-node,
  .CodeMirror.cm-s-css .cm-node,
  .CodeMirror.cm-s-neo .cm-tag,
  .CodeMirror.cm-s-css .cm-tag {
    color: #e74c3c;
  }

  .CodeMirror.cm-s-neo .cm-string,
  .CodeMirror.cm-s-css .cm-string {
    color: #e67e22;
  }

  .CodeMirror.cm-s-neo .cm-variable,
  .CodeMirror.cm-s-css .cm-variable,
  .CodeMirror.cm-s-neo .cm-qualifier,
  .CodeMirror.cm-s-css .cm-qualifier {
    color: #1abc9c;
  }

  #grass .CodeMirror {
    font-size: 14px;
    line-height: 18px;
  }

  #editor.file-loaded .CodeMirror {
    margin-right: 12px;
  }

  .CodeMirror {
    background-color: #fff;
    padding: 12px;
    border-radius: 4px;
    transist: all;
  }

  .CodeMirror pre {
    padding: 0;
  }

  .CodeMirror .CodeMirror-placeholder {
    color: #e0e2e6;
  }

  .CodeMirror-lines {
    padding: 0;
  }

  .CodeMirror-gutters {
    border: none;
    border-right: 10px solid transparent;
    background-color: transparent;
  }

  .CodeMirror-linenumber {
    padding: 0;
    color: #e0e2e5;
    opacity: 1;
  }

  .CodeMirror {
    height: auto;
  }

  .CodeMirror-scroll {
    overflow: hidden;
    max-height: 140px;
  }

  .CodeMirror div.CodeMirror-cursor {
    border-left: 11px solid rgba(155,157,162,0.37);
    z-index: 3;
  }

  .CodeMirror-sizer {
    transist: min-height;
  }

  .CodeMirror-scroll div:nth-child(2) {
    transist: top;
  }

  .prompt {
    absolute: top 24px left 46px;
    color: #93969b;
    opacity: 0;
    z-index: 100;
  }

  .one-line .prompt {
    opacity: 1;
  }

  .one-line .CodeMirror .CodeMirror-linenumber {
    opacity: 0;
  }

  .disable-highlighting .CodeMirror .CodeMirror-code * {
    color: #7b7f89;
  }

  .cypher-hints {
    width: 0.8em;
  }

  .gutter-warning {
    color: color-warning-on-white;
    opacity: 0.6;
    font-size: 14px;
    line-height: 23px;
    display: inherit;
    cursor: pointer;
  }

`
