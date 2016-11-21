'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _ramda = require('ramda');

var _ramda2 = _interopRequireDefault(_ramda);

var _repeat = require('core-js/library/fn/string/repeat');

var _repeat2 = _interopRequireDefault(_repeat);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

var len = function len(val) {
  return typeof val === 'undefined' ? 0 : ('' + val).length;
};
var padString = function padString(character, width) {
  return !width ? '' : (0, _repeat2.default)(character, width);
};
var stringifyRows = function stringifyRows(rows) {
  if (!Array.isArray(rows) || !rows.length) return [];
  return rows.map(function (row) {
    return row.map(JSON.stringify);
  });
};
var insertColSeparators = function insertColSeparators(arr) {
  return '│' + arr.join('│') + '│';
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

var colWidths = function colWidths(maxWidth, minWidth, input) {
  if (!Array.isArray(input)) {
    return 0;
  }
  return input[0].map(function (_, i) {
    var tCol = _ramda2.default.pluck(i, input).map(function (col) {
      return len(col);
    });
    var measuredMax = Math.max(_ramda2.default.apply(Math.max, tCol), minWidth);
    return measuredMax > maxWidth && maxWidth > 0 ? maxWidth : measuredMax;
  });
};

var rowHeights = function rowHeights(maxWidth, input) {
  return input.map(function (row) {
    var maxLen = _ramda2.default.apply(Math.max, row.map(function (col) {
      return len(col);
    }));
    var numLines = Math.ceil(maxLen / maxWidth);
    return numLines;
  });
};

var splitRowsToLines = function splitRowsToLines(maxWidth, heights, widths, input) {
  return input.map(function (row, i) {
    return row.map(function (col, colIndex) {
      var lines = _ramda2.default.splitEvery(maxWidth, col);
      var lastLinesLen = len(_ramda2.default.last(lines));
      if (lastLinesLen < widths[colIndex]) {
        lines[lines.length - 1] = lines[lines.length - 1] + padString(' ', widths[colIndex] - lastLinesLen);
      }
      while (lines.length < heights[i]) {
        var _ref;

        lines = (_ref = []).concat.apply(_ref, _toConsumableArray(lines).concat([[padString(' ', widths[colIndex])]]));
      }
      return lines;
    });
  });
};

var createLines = function createLines(rows) {
  return rows.reduce(function (lines, row) {
    if (!Array.isArray(row)) {
      return [].concat(lines, row);
    }
    var tRow = _ramda2.default.transpose(row).map(insertColSeparators);
    return [].concat(lines, tRow);
  }, []);
};

var renderForWidth = function renderForWidth(rows) {
  var maxColWidth = arguments.length <= 1 || arguments[1] === undefined ? 30 : arguments[1];
  var minColWidth = arguments.length <= 2 || arguments[2] === undefined ? 3 : arguments[2];

  if (!Array.isArray(rows) || !rows.length) {
    return '';
  }
  maxColWidth = parseInt(maxColWidth);
  var widths = colWidths(maxColWidth, minColWidth, rows);
  var heights = rowHeights(maxColWidth, rows);
  var norm = splitRowsToLines(maxColWidth, heights, widths, rows);
  var header = createLines([_ramda2.default.head(norm)]);
  var separated = _ramda2.default.intersperse(getThinSeparatorLine(widths), _ramda2.default.tail(norm));
  var lines = createLines(separated);
  return [getTopSeparatorLine(widths)].concat(_toConsumableArray(header), [getThickSeparatorLine(widths)], _toConsumableArray(lines), [getBottomSeparatorLine(widths)]).join('\n');
};

exports.default = {
  serializeData: function serializeData(rows) {
    return stringifyRows(rows);
  },
  tableFromSerializedData: function tableFromSerializedData(serializedRows) {
    var maxColumnWidth = arguments.length <= 1 || arguments[1] === undefined ? 30 : arguments[1];
    return renderForWidth(serializedRows, maxColumnWidth);
  },
  table: function table(rows) {
    var maxColumnWidth = arguments.length <= 1 || arguments[1] === undefined ? 30 : arguments[1];
    return renderForWidth(stringifyRows(rows), maxColumnWidth);
  },
  maxColumnWidth: function maxColumnWidth(rows) {
    return _ramda2.default.apply(Math.max, colWidths(0, 0, stringifyRows(rows)));
  }
};

//# sourceMappingURL=ascii-data-table.js.map