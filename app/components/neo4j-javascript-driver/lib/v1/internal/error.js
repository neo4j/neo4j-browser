/**
 * Copyright (c) 2002-2016 "Neo Technology,"
 * Network Engine for Objects in Lund AB [http://neotechnology.com]
 *
 * This file is part of Neo4j.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

// A common place for constructing error objects, to keep them
// uniform across the driver surface.

"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _get = function get(_x3, _x4, _x5) { var _again = true; _function: while (_again) { var object = _x3, property = _x4, receiver = _x5; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x3 = parent; _x4 = property; _x5 = receiver; _again = true; desc = parent = undefined; continue _function; } } else if ("value" in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

function newError(message) {
  var code = arguments.length <= 1 || arguments[1] === undefined ? "N/A" : arguments[1];

  // TODO: Idea is that we can check the cod here and throw sub-classes
  // of Neo4jError as appropriate
  return new Neo4jError(message, code);
}

// TODO: This should be moved into public API

var Neo4jError = (function (_Error) {
  _inherits(Neo4jError, _Error);

  function Neo4jError(message) {
    var code = arguments.length <= 1 || arguments[1] === undefined ? "N/A" : arguments[1];

    _classCallCheck(this, Neo4jError);

    _get(Object.getPrototypeOf(Neo4jError.prototype), "constructor", this).call(this, message);
    this.message = message;
    this.code = code;
  }

  return Neo4jError;
})(Error);

exports.newError = newError;
exports.Neo4jError = Neo4jError;