var AsciiTable =
/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId])
/******/ 			return installedModules[moduleId].exports;
/******/
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			exports: {},
/******/ 			id: moduleId,
/******/ 			loaded: false
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.loaded = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/*!**********************!*\
  !*** ./src/entry.js ***!
  \**********************/
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	var _asciiDataTable = __webpack_require__(/*! ../src/ascii-data-table */ 1);
	
	var _asciiDataTable2 = _interopRequireDefault(_asciiDataTable);
	
	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
	
	module.exports = _asciiDataTable2.default;

/***/ },
/* 1 */
/*!*********************************!*\
  !*** ./src/ascii-data-table.js ***!
  \*********************************/
/***/ function(module, exports) {

	'use strict';
	
	Object.defineProperty(exports, "__esModule", {
	  value: true
	});
	
	var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol ? "symbol" : typeof obj; };
	
	var getArray = function getArray(len) {
	  return Array.apply(null, Array(len)).map(function (_, i) {
	    return i;
	  });
	};
	
	var stringifyVal = function stringifyVal(val) {
	  if (Array.isArray(val)) return stringifyArray(val);
	  if (typeof val === 'number') return val;
	  if (typeof val === 'string') return val;
	  if (typeof val === 'boolean') return val;
	  if (val === null) return '(null)';
	  if ((typeof val === 'undefined' ? 'undefined' : _typeof(val)) === 'object') return stringifyObject(val);
	};
	
	var stringifyArray = function stringifyArray(arr) {
	  return '[' + arr.map(stringifyVal).join(', ') + ']';
	};
	
	var stringifyObject = function stringifyObject(obj) {
	  if ((typeof obj === 'undefined' ? 'undefined' : _typeof(obj)) !== 'object') return obj;
	  return '{' + Object.keys(obj).map(function (key) {
	    return key + ': ' + stringifyVal(obj[key]);
	  }).join(', ') + '}';
	};
	
	var stringifyLines = function stringifyLines(rows) {
	  if (!Array.isArray(rows) || !rows.length) return [];
	  return rows.map(function (row) {
	    return row.map(stringifyVal);
	  });
	};
	
	var getRowIndexForLine = function getRowIndexForLine(rowHeights, lineNumber) {
	  return rowHeights.reduce(function (meta, height, rowIndex) {
	    if (meta.remainingLines < 0) return meta;
	    meta.rowIndex = rowIndex;
	    if (meta.remainingLines < height) {
	      meta.lineIndex = meta.remainingLines;
	    }
	    meta.remainingLines = meta.remainingLines - height;
	    return meta;
	  }, {
	    rowIndex: 0,
	    lineIndex: 0,
	    remainingLines: lineNumber
	  });
	};
	
	var getLineFromCol = function getLineFromCol(prev, _, colIndex) {
	  var linesStr = prev.colsLines[prev.rowIndex][colIndex].filter(function (_, lineIndex) {
	    return lineIndex === prev.lineIndex;
	  }).map(function (line) {
	    return line + padString(' ', prev.colWidths[colIndex] - line.length);
	  });
	  prev.lines.push(linesStr);
	  return prev;
	};
	
	var getColLines = function getColLines(col, colWidth, rowHeight) {
	  var colLines = getLinesFromString(col).reduce(function (final, curr) {
	    return final.concat(('' + curr).match(new RegExp('.{1,' + colWidth + '}', 'g')) || ['']);
	  }, []);
	  return colLines.concat(getArray(rowHeight - colLines.length).map(function (a) {
	    return ' ';
	  }));
	};
	
	var getLinesFromString = function getLinesFromString(str) {
	  if (typeof str !== 'string') return [str];
	  return str.indexOf('\n') > -1 ? str.split('\n') : [str];
	};
	
	var getColWidths = function getColWidths(rows) {
	  return getArray(rows[0].length).map(function (i) {
	    return rows.reduce(function (prev, curr) {
	      var lines = getLinesFromString(curr[i]);
	      var currMax = lines.reduce(function (max, line) {
	        return Math.max(max, ('' + line).length);
	      }, 0);
	      return Math.max(prev, currMax);
	    }, 0);
	  });
	};
	
	var renderForWidth = function renderForWidth(rows) {
	  var maxColWidth = arguments.length <= 1 || arguments[1] === undefined ? 30 : arguments[1];
	  var minColWidth = arguments.length <= 2 || arguments[2] === undefined ? 3 : arguments[2];
	
	  if (!Array.isArray(rows) || !rows.length) return '';
	  var colWidths = getColWidths(rows).map(function (colWidth) {
	    return Math.max(Math.min(colWidth, maxColWidth), minColWidth);
	  });
	  var rowHeights = rows.map(function (row) {
	    return row.reduce(function (prev, curr, colIndex) {
	      var lines = getLinesFromString(curr);
	      return lines.reduce(function (tot, line) {
	        return tot + Math.max(1, Math.max(prev, Math.ceil(('' + line).length / colWidths[colIndex])));
	      }, 0);
	    }, 0);
	  });
	  var totalLines = rowHeights.reduce(function (tot, curr) {
	    return tot + curr;
	  }, 0);
	  var colsLines = rows.reduce(function (colLines, row, rowIndex) {
	    var cols = row.map(function (col, colIndex) {
	      return getColLines(col, colWidths[colIndex], rowHeights[rowIndex]);
	    });
	    return colLines.concat([cols]);
	  }, []);
	  var output = getArray(totalLines).reduce(function (out, _, i) {
	    var lineMeta = getRowIndexForLine(rowHeights, i);
	    var rowLines = rows[lineMeta.rowIndex].reduce(getLineFromCol, {
	      lines: [],
	      lineIndex: lineMeta.lineIndex,
	      colWidths: colWidths,
	      colsLines: colsLines,
	      rowIndex: lineMeta.rowIndex
	    }).lines.join('│');
	    out.push('│' + rowLines + '│');
	    return out;
	  }, []);
	  output = insertRowSeparators(output, rowHeights, colWidths);
	  return output.join('\n');
	};
	
	var insertRowSeparators = function insertRowSeparators(lines, rowHeights, colWidths) {
	  return rowHeights.reduce(function (out, rowHeight, rowIndex) {
	    out.curr.push.apply(out.curr, out.feeder.splice(0, rowHeight));
	    if (rowIndex === 0) {
	      out.curr.push(getThickSeparatorLine(colWidths));
	    } else if (rowIndex === rowHeights.length - 1) {
	      out.curr.push(getBottomSeparatorLine(colWidths));
	    } else {
	      out.curr.push(getThinSeparatorLine(colWidths));
	    }
	    return out;
	  }, {
	    feeder: lines,
	    curr: [getTopSeparatorLine(colWidths)]
	  }).curr;
	};
	
	var getTopSeparatorLine = function getTopSeparatorLine(colWidths) {
	  return getSeparatorLine('═', '╒', '╤', '╕', colWidths);
	};
	var getThickSeparatorLine = function getThickSeparatorLine(colWidths) {
	  return getSeparatorLine('═', '╞', '╪', '╡', colWidths);
	};
	var getThinSeparatorLine = function getThinSeparatorLine(colWidths) {
	  return getSeparatorLine('─', '├', '┼', '┤', colWidths);
	};
	var getBottomSeparatorLine = function getBottomSeparatorLine(colWidths) {
	  return getSeparatorLine('─', '└', '┴', '┘', colWidths);
	};
	var getSeparatorLine = function getSeparatorLine(horChar, leftChar, crossChar, rightChar, colWidths) {
	  return leftChar + colWidths.map(function (w) {
	    return padString(horChar, w);
	  }).join(crossChar) + rightChar;
	};
	
	var padString = function padString(character, width) {
	  if (width < 1) return '';
	  return getArray(width).map(function () {
	    return character;
	  }).join('');
	};
	
	exports.default = {
	  run: function run(rows) {
	    var options = arguments.length <= 1 || arguments[1] === undefined ? { maxColumnWidth: 30 } : arguments[1];
	    return renderForWidth(stringifyLines(rows), options.maxColumnWidth);
	  },
	  getMaxColumnWidth: function getMaxColumnWidth(rows) {
	    return getColWidths(stringifyLines(rows)).reduce(function (max, colWidth) {
	      return Math.max(max, colWidth);
	    }, 0);
	  }
	};

/***/ }
/******/ ]);
//# sourceMappingURL=bundle.js.map