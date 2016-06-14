
/*!
Copyright (c) 2002-2016 "Neo Technology,"
Network Engine for Objects in Lund AB [http://neotechnology.com]

This file is part of Neo4j.

Neo4j is free software: you can redistribute it and/or modify
it under the terms of the GNU General Public License as published by
the Free Software Foundation, either version 3 of the License, or
(at your option) any later version.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
GNU General Public License for more details.

You should have received a copy of the GNU General Public License
along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */
'use strict';
var hasProp = {}.hasOwnProperty;

window.neo = window.neo || {};

neo.models = {};

neo.renderers = {
  menu: [],
  node: [],
  relationship: []
};

neo.utils = {
  copy: function(src) {
    return JSON.parse(JSON.stringify(src));
  },
  extend: function(dest, src) {
    var k, v;
    if (!neo.utils.isObject(dest) && neo.utils.isObject(src)) {
      return;
    }
    for (k in src) {
      if (!hasProp.call(src, k)) continue;
      v = src[k];
      dest[k] = v;
    }
    return dest;
  },
  isArray: Array.isArray || function(obj) {
    return Object.prototype.toString.call(obj) === '[object Array]';
  },
  isObject: function(obj) {
    return Object(obj) === obj;
  }
};


/*!
Copyright (c) 2002-2016 "Neo Technology,"
Network Engine for Objects in Lund AB [http://neotechnology.com]

This file is part of Neo4j.

Neo4j is free software: you can redistribute it and/or modify
it under the terms of the GNU General Public License as published by
the Free Software Foundation, either version 3 of the License, or
(at your option) any later version.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
GNU General Public License for more details.

You should have received a copy of the GNU General Public License
along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */
'use strict';
neo.collision = (function() {
  var collide, collision;
  collision = {};
  collide = function(node) {
    var nx1, nx2, ny1, ny2, r;
    r = node.radius + 10;
    nx1 = node.x - r;
    nx2 = node.x + r;
    ny1 = node.y - r;
    ny2 = node.y + r;
    return function(quad, x1, y1, x2, y2) {
      var l, x, y;
      if (quad.point && (quad.point !== node)) {
        x = node.x - quad.point.x;
        y = node.y - quad.point.y;
        l = Math.sqrt(x * x + y * y);
        r = node.radius + 10 + quad.point.radius;
      }
      if (l < r) {
        l = (l - r) / l * .5;
        node.x -= x *= l;
        node.y -= y *= l;
        quad.point.x += x;
        quad.point.y += y;
      }
      return x1 > nx2 || x2 < nx1 || y1 > ny2 || y2 < ny1;
    };
  };
  collision.avoidOverlap = function(nodes) {
    var i, len, n, q, results;
    q = d3.geom.quadtree(nodes);
    results = [];
    for (i = 0, len = nodes.length; i < len; i++) {
      n = nodes[i];
      results.push(q.visit(collide(n)));
    }
    return results;
  };
  return collision;
})();


/*!
Copyright (c) 2002-2016 "Neo Technology,"
Network Engine for Objects in Lund AB [http://neotechnology.com]

This file is part of Neo4j.

Neo4j is free software: you can redistribute it and/or modify
it under the terms of the GNU General Public License as published by
the Free Software Foundation, either version 3 of the License, or
(at your option) any later version.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
GNU General Public License for more details.

You should have received a copy of the GNU General Public License
along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */
'use strict';
var bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

neo.models.Graph = (function() {
  function Graph() {
    this.findAllRelationshipToNode = bind(this.findAllRelationshipToNode, this);
    this.findRelationship = bind(this.findRelationship, this);
    this.findNodeNeighbourIds = bind(this.findNodeNeighbourIds, this);
    this.findNode = bind(this.findNode, this);
    this.pruneInternalRelationships = bind(this.pruneInternalRelationships, this);
    this.addInternalRelationships = bind(this.addInternalRelationships, this);
    this.addRelationships = bind(this.addRelationships, this);
    this.removeConnectedRelationships = bind(this.removeConnectedRelationships, this);
    this.updateNode = bind(this.updateNode, this);
    this.removeNode = bind(this.removeNode, this);
    this.addNodes = bind(this.addNodes, this);
    this.nodeMap = {};
    this._nodes = [];
    this.relationshipMap = {};
    this._relationships = [];
  }

  Graph.prototype.nodes = function() {
    return this._nodes;
  };

  Graph.prototype.relationships = function() {
    return this._relationships;
  };

  Graph.prototype.groupedRelationships = function() {
    var NodePair, groups, i, ignored, len, nodePair, pair, ref, ref1, relationship, results;
    NodePair = (function() {
      function NodePair(node1, node2) {
        this.relationships = [];
        if (node1.id < node2.id) {
          this.nodeA = node1;
          this.nodeB = node2;
        } else {
          this.nodeA = node2;
          this.nodeB = node1;
        }
      }

      NodePair.prototype.isLoop = function() {
        return this.nodeA === this.nodeB;
      };

      NodePair.prototype.toString = function() {
        return this.nodeA.id + ":" + this.nodeB.id;
      };

      return NodePair;

    })();
    groups = {};
    ref = this._relationships;
    for (i = 0, len = ref.length; i < len; i++) {
      relationship = ref[i];
      nodePair = new NodePair(relationship.source, relationship.target);
      nodePair = (ref1 = groups[nodePair]) != null ? ref1 : nodePair;
      nodePair.relationships.push(relationship);
      groups[nodePair] = nodePair;
    }
    results = [];
    for (ignored in groups) {
      pair = groups[ignored];
      results.push(pair);
    }
    return results;
  };

  Graph.prototype.addNodes = function(nodes) {
    var i, len, node;
    for (i = 0, len = nodes.length; i < len; i++) {
      node = nodes[i];
      if (this.findNode(node.id) == null) {
        this.nodeMap[node.id] = node;
        this._nodes.push(node);
      }
    }
    return this;
  };

  Graph.prototype.removeNode = function(node) {
    if (this.findNode(node.id) != null) {
      delete this.nodeMap[node.id];
      this._nodes.splice(this._nodes.indexOf(node), 1);
    }
    return this;
  };

  Graph.prototype.updateNode = function(node) {
    if (this.findNode(node.id) != null) {
      this.removeNode(node);
      node.expanded = false;
      node.minified = true;
      this.addNodes([node]);
    }
    return this;
  };

  Graph.prototype.removeConnectedRelationships = function(node) {
    var i, len, r, ref;
    ref = this.findAllRelationshipToNode(node);
    for (i = 0, len = ref.length; i < len; i++) {
      r = ref[i];
      this.updateNode(r.source);
      this.updateNode(r.target);
      this._relationships.splice(this._relationships.indexOf(r), 1);
      delete this.relationshipMap[r.id];
    }
    return this;
  };

  Graph.prototype.addRelationships = function(relationships) {
    var existingRelationship, i, len, relationship;
    for (i = 0, len = relationships.length; i < len; i++) {
      relationship = relationships[i];
      existingRelationship = this.findRelationship(relationship.id);
      if (existingRelationship != null) {
        existingRelationship.internal = false;
      } else {
        relationship.internal = false;
        this.relationshipMap[relationship.id] = relationship;
        this._relationships.push(relationship);
      }
    }
    return this;
  };

  Graph.prototype.addInternalRelationships = function(relationships) {
    var i, len, relationship;
    for (i = 0, len = relationships.length; i < len; i++) {
      relationship = relationships[i];
      relationship.internal = true;
      if (this.findRelationship(relationship.id) == null) {
        this.relationshipMap[relationship.id] = relationship;
        this._relationships.push(relationship);
      }
    }
    return this;
  };

  Graph.prototype.pruneInternalRelationships = function() {
    var relationships;
    relationships = this._relationships.filter(function(relationship) {
      return !relationship.internal;
    });
    this.relationshipMap = {};
    this._relationships = [];
    return this.addRelationships(relationships);
  };

  Graph.prototype.findNode = function(id) {
    return this.nodeMap[id];
  };

  Graph.prototype.findNodeNeighbourIds = function(id) {
    return this._relationships.filter(function(relationship) {
      return relationship.source.id === id || relationship.target.id === id;
    }).map(function(relationship) {
      if (relationship.target.id === id) {
        return relationship.source.id;
      }
      return relationship.target.id;
    });
  };

  Graph.prototype.findRelationship = function(id) {
    return this.relationshipMap[id];
  };

  Graph.prototype.findAllRelationshipToNode = function(node) {
    return this._relationships.filter(function(relationship) {
      return relationship.source.id === node.id || relationship.target.id === node.id;
    });
  };

  return Graph;

})();


/*!
Copyright (c) 2002-2016 "Neo Technology,"
Network Engine for Objects in Lund AB [http://neotechnology.com]

This file is part of Neo4j.

Neo4j is free software: you can redistribute it and/or modify
it under the terms of the GNU General Public License as published by
the Free Software Foundation, either version 3 of the License, or
(at your option) any later version.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
GNU General Public License for more details.

You should have received a copy of the GNU General Public License
along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */
'use strict';
var NeoD3Geometry;

NeoD3Geometry = (function() {
  var addShortenedNextWord, fitCaptionIntoCircle, noEmptyLines, square;

  square = function(distance) {
    return distance * distance;
  };

  function NeoD3Geometry(style1) {
    this.style = style1;
    this.relationshipRouting = new neo.utils.pairwiseArcsRelationshipRouting(this.style);
  }

  addShortenedNextWord = function(line, word, measure) {
    var results;
    results = [];
    while (!(word.length <= 2)) {
      word = word.substr(0, word.length - 2) + '\u2026';
      if (measure(word) < line.remainingWidth) {
        line.text += " " + word;
        break;
      } else {
        results.push(void 0);
      }
    }
    return results;
  };

  noEmptyLines = function(lines) {
    var i, len, line;
    for (i = 0, len = lines.length; i < len; i++) {
      line = lines[i];
      if (line.text.length === 0) {
        return false;
      }
    }
    return true;
  };

  fitCaptionIntoCircle = function(node, style) {
    var candidateLines, candidateWords, captionText, consumedWords, emptyLine, fitOnFixedNumberOfLines, fontFamily, fontSize, i, lineCount, lineHeight, lines, maxLines, measure, ref, ref1, ref2, template, words;
    template = style.forNode(node).get("caption");
    captionText = style.interpolate(template, node);
    fontFamily = 'sans-serif';
    fontSize = parseFloat(style.forNode(node).get('font-size'));
    lineHeight = fontSize;
    measure = function(text) {
      return neo.utils.measureText(text, fontFamily, fontSize);
    };
    words = captionText.split(" ");
    emptyLine = function(lineCount, iLine) {
      var baseline, constainingHeight, lineWidth;
      baseline = (1 + iLine - lineCount / 2) * lineHeight;
      constainingHeight = iLine < lineCount / 2 ? baseline - lineHeight : baseline;
      lineWidth = Math.sqrt(square(node.radius) - square(constainingHeight)) * 2;
      return {
        node: node,
        text: '',
        baseline: baseline,
        remainingWidth: lineWidth
      };
    };
    fitOnFixedNumberOfLines = function(lineCount) {
      var i, iLine, iWord, line, lines, ref;
      lines = [];
      iWord = 0;
      for (iLine = i = 0, ref = lineCount - 1; 0 <= ref ? i <= ref : i >= ref; iLine = 0 <= ref ? ++i : --i) {
        line = emptyLine(lineCount, iLine);
        while (iWord < words.length && measure(" " + words[iWord]) < line.remainingWidth) {
          line.text += " " + words[iWord];
          line.remainingWidth -= measure(" " + words[iWord]);
          iWord++;
        }
        lines.push(line);
      }
      if (iWord < words.length) {
        addShortenedNextWord(lines[lineCount - 1], words[iWord], measure);
      }
      return [lines, iWord];
    };
    consumedWords = 0;
    maxLines = node.radius * 2 / fontSize;
    lines = [emptyLine(1, 0)];
    for (lineCount = i = 1, ref = maxLines; 1 <= ref ? i <= ref : i >= ref; lineCount = 1 <= ref ? ++i : --i) {
      ref1 = fitOnFixedNumberOfLines(lineCount), candidateLines = ref1[0], candidateWords = ref1[1];
      if (noEmptyLines(candidateLines)) {
        ref2 = [candidateLines, candidateWords], lines = ref2[0], consumedWords = ref2[1];
      }
      if (consumedWords >= words.length) {
        return lines;
      }
    }
    return lines;
  };

  NeoD3Geometry.prototype.formatNodeCaptions = function(nodes) {
    var i, len, node, results;
    results = [];
    for (i = 0, len = nodes.length; i < len; i++) {
      node = nodes[i];
      results.push(node.caption = fitCaptionIntoCircle(node, this.style));
    }
    return results;
  };

  NeoD3Geometry.prototype.formatRelationshipCaptions = function(relationships) {
    var i, len, relationship, results, template;
    results = [];
    for (i = 0, len = relationships.length; i < len; i++) {
      relationship = relationships[i];
      template = this.style.forRelationship(relationship).get("caption");
      results.push(relationship.caption = this.style.interpolate(template, relationship));
    }
    return results;
  };

  NeoD3Geometry.prototype.setNodeRadii = function(nodes) {
    var i, len, node, results;
    results = [];
    for (i = 0, len = nodes.length; i < len; i++) {
      node = nodes[i];
      results.push(node.radius = parseFloat(this.style.forNode(node).get("diameter")) / 2);
    }
    return results;
  };

  NeoD3Geometry.prototype.onGraphChange = function(graph) {
    this.setNodeRadii(graph.nodes());
    this.formatNodeCaptions(graph.nodes());
    this.formatRelationshipCaptions(graph.relationships());
    return this.relationshipRouting.measureRelationshipCaptions(graph.relationships());
  };

  NeoD3Geometry.prototype.onTick = function(graph) {
    return this.relationshipRouting.layoutRelationships(graph);
  };

  return NeoD3Geometry;

})();


/*!
Copyright (c) 2002-2016 "Neo Technology,"
Network Engine for Objects in Lund AB [http://neotechnology.com]

This file is part of Neo4j.

Neo4j is free software: you can redistribute it and/or modify
it under the terms of the GNU General Public License as published by
the Free Software Foundation, either version 3 of the License, or
(at your option) any later version.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
GNU General Public License for more details.

You should have received a copy of the GNU General Public License
along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */
'use strict';
var slice = [].slice;

neo.graphView = (function() {
  function graphView(element, measureSize, graph, style) {
    var callbacks, layout;
    this.graph = graph;
    this.style = style;
    layout = neo.layout.force();
    this.viz = neo.viz(element, measureSize, this.graph, layout, this.style);
    this.callbacks = {};
    callbacks = this.callbacks;
    this.viz.trigger = (function() {
      return function() {
        var args, callback, event, i, len, ref, results;
        event = arguments[0], args = 2 <= arguments.length ? slice.call(arguments, 1) : [];
        ref = callbacks[event] || [];
        results = [];
        for (i = 0, len = ref.length; i < len; i++) {
          callback = ref[i];
          results.push(callback.apply(null, args));
        }
        return results;
      };
    })();
  }

  graphView.prototype.on = function(event, callback) {
    var base;
    ((base = this.callbacks)[event] != null ? base[event] : base[event] = []).push(callback);
    return this;
  };

  graphView.prototype.layout = function(value) {
    var layout;
    if (!arguments.length) {
      return layout;
    }
    layout = value;
    return this;
  };

  graphView.prototype.grass = function(value) {
    if (!arguments.length) {
      return this.style.toSheet();
    }
    this.style.importGrass(value);
    return this;
  };

  graphView.prototype.update = function() {
    this.viz.update();
    return this;
  };

  graphView.prototype.resize = function() {
    this.viz.resize();
    return this;
  };

  graphView.prototype.boundingBox = function() {
    return this.viz.boundingBox();
  };

  graphView.prototype.collectStats = function() {
    return this.viz.collectStats();
  };

  return graphView;

})();


/*!
Copyright (c) 2002-2016 "Neo Technology,"
Network Engine for Objects in Lund AB [http://neotechnology.com]

This file is part of Neo4j.

Neo4j is free software: you can redistribute it and/or modify
it under the terms of the GNU General Public License as published by
the Free Software Foundation, either version 3 of the License, or
(at your option) any later version.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
GNU General Public License for more details.

You should have received a copy of the GNU General Public License
along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */
'use strict';
neo.layout = (function() {
  var _layout;
  _layout = {};
  _layout.force = function() {
    var _force;
    _force = {};
    _force.init = function(render) {
      var accelerateLayout, currentStats, d3force, forceLayout, linkDistance, newStatsBucket, oneRelationshipPerPairOfNodes;
      forceLayout = {};
      linkDistance = 45;
      d3force = d3.layout.force().linkDistance(function(relationship) {
        return relationship.source.radius + relationship.target.radius + linkDistance;
      }).charge(-1000);
      newStatsBucket = function() {
        var bucket;
        bucket = {
          layoutTime: 0,
          layoutSteps: 0
        };
        return bucket;
      };
      currentStats = newStatsBucket();
      forceLayout.collectStats = function() {
        var latestStats;
        latestStats = currentStats;
        currentStats = newStatsBucket();
        return latestStats;
      };
      accelerateLayout = function() {
        var d3Tick, maxAnimationFramesPerSecond, maxComputeTime, maxStepsPerTick, now;
        maxStepsPerTick = 100;
        maxAnimationFramesPerSecond = 60;
        maxComputeTime = 1000 / maxAnimationFramesPerSecond;
        now = window.performance && window.performance.now ? function() {
          return window.performance.now();
        } : function() {
          return Date.now();
        };
        d3Tick = d3force.tick;
        return d3force.tick = function() {
          var startCalcs, startTick, step;
          startTick = now();
          step = maxStepsPerTick;
          while (step-- && now() - startTick < maxComputeTime) {
            startCalcs = now();
            currentStats.layoutSteps++;
            neo.collision.avoidOverlap(d3force.nodes());
            if (d3Tick()) {
              maxStepsPerTick = 2;
              return true;
            }
            currentStats.layoutTime += now() - startCalcs;
          }
          render();
          return false;
        };
      };
      accelerateLayout();
      oneRelationshipPerPairOfNodes = function(graph) {
        var i, len, pair, ref, results;
        ref = graph.groupedRelationships();
        results = [];
        for (i = 0, len = ref.length; i < len; i++) {
          pair = ref[i];
          results.push(pair.relationships[0]);
        }
        return results;
      };
      forceLayout.update = function(graph, size) {
        var center, nodes, radius, relationships;
        nodes = neo.utils.cloneArray(graph.nodes());
        relationships = oneRelationshipPerPairOfNodes(graph);
        radius = nodes.length * linkDistance / (Math.PI * 2);
        center = {
          x: size[0] / 2,
          y: size[1] / 2
        };
        neo.utils.circularLayout(nodes, center, radius);
        return d3force.nodes(nodes).links(relationships).size(size).start();
      };
      forceLayout.drag = d3force.drag;
      return forceLayout;
    };
    return _force;
  };
  return _layout;
})();


/*!
Copyright (c) 2002-2016 "Neo Technology,"
Network Engine for Objects in Lund AB [http://neotechnology.com]

This file is part of Neo4j.

Neo4j is free software: you can redistribute it and/or modify
it under the terms of the GNU General Public License as published by
the Free Software Foundation, either version 3 of the License, or
(at your option) any later version.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
GNU General Public License for more details.

You should have received a copy of the GNU General Public License
along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */
'use strict';
var hasProp = {}.hasOwnProperty;

neo.models.Node = (function() {
  function Node(id, labels, properties) {
    var key, value;
    this.id = id;
    this.labels = labels;
    this.propertyMap = properties;
    this.propertyList = (function() {
      var results;
      results = [];
      for (key in properties) {
        if (!hasProp.call(properties, key)) continue;
        value = properties[key];
        results.push({
          key: key,
          value: value
        });
      }
      return results;
    })();
  }

  Node.prototype.toJSON = function() {
    return this.propertyMap;
  };

  Node.prototype.isNode = true;

  Node.prototype.isRelationship = false;

  Node.prototype.relationshipCount = function(graph) {
    var i, len, node, ref, relationship, rels;
    node = this;
    rels = [];
    ref = graph.relationships();
    for (i = 0, len = ref.length; i < len; i++) {
      relationship = ref[i];
      if (relationship.source === node || relationship.target === node) {
        rels.push[relationship];
      }
    }
    return rels.length;
  };

  return Node;

})();


/*!
Copyright (c) 2002-2016 "Neo Technology,"
Network Engine for Objects in Lund AB [http://neotechnology.com]

This file is part of Neo4j.

Neo4j is free software: you can redistribute it and/or modify
it under the terms of the GNU General Public License as published by
the Free Software Foundation, either version 3 of the License, or
(at your option) any later version.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
GNU General Public License for more details.

You should have received a copy of the GNU General Public License
along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */
'use strict';
neo.queryPlan = function(element) {
  var augment, color, colors, costColor, detailFontSize, display, dividerColor, fixedWidthFont, formatNumber, layout, linkColor, margin, maxChildOperators, maxComparableDbHits, maxComparableRows, maxCostHeight, operatorCategories, operatorColors, operatorCornerRadius, operatorDetailHeight, operatorDetails, operatorHeaderFontSize, operatorHeaderHeight, operatorMargin, operatorPadding, operatorWidth, plural, rankMargin, render, rows, standardFont, transform;
  maxChildOperators = 2;
  maxComparableRows = 1000000;
  maxComparableDbHits = 1000000;
  operatorWidth = 180;
  operatorCornerRadius = 4;
  operatorHeaderHeight = 18;
  operatorHeaderFontSize = 11;
  operatorDetailHeight = 14;
  maxCostHeight = 50;
  detailFontSize = 10;
  operatorMargin = 50;
  operatorPadding = 3;
  rankMargin = 50;
  margin = 10;
  standardFont = "'Helvetica Neue',Helvetica,Arial,sans-serif";
  fixedWidthFont = "Monaco,'Courier New',Terminal,monospace";
  linkColor = '#DFE1E3';
  costColor = '#F25A29';
  dividerColor = '#DFE1E3';
  operatorColors = colorbrewer.Blues[9].slice(2);
  operatorCategories = {
    result: ['result'],
    seek: ['scan', 'seek', 'argument'],
    rows: ['limit', 'top', 'skip', 'sort', 'union', 'projection'],
    other: [],
    filter: ['select', 'filter', 'apply', 'distinct'],
    expand: ['expand', 'product', 'join', 'optional', 'path'],
    eager: ['eager']
  };
  augment = function(color) {
    return {
      color: color,
      'border-color': d3.rgb(color).darker(),
      'text-color-internal': d3.hsl(color).l < 0.7 ? '#FFFFFF' : '#000000'
    };
  };
  colors = d3.scale.ordinal().domain(d3.keys(operatorCategories)).range(operatorColors);
  color = function(d) {
    var j, keyword, keywords, len, name;
    for (name in operatorCategories) {
      keywords = operatorCategories[name];
      for (j = 0, len = keywords.length; j < len; j++) {
        keyword = keywords[j];
        if (new RegExp(keyword, 'i').test(d)) {
          return augment(colors(name));
        }
      }
    }
    return augment(colors('other'));
  };
  rows = function(operator) {
    var ref, ref1;
    return (ref = (ref1 = operator.Rows) != null ? ref1 : operator.EstimatedRows) != null ? ref : 0;
  };
  plural = function(noun, count) {
    if (count === 1) {
      return noun;
    } else {
      return noun + 's';
    }
  };
  formatNumber = d3.format(",.0f");
  operatorDetails = function(operator) {
    var detail, details, expression, identifiers, index, j, len, ref, ref1, ref2, ref3, wordWrap, y;
    if (!operator.expanded) {
      return [];
    }
    details = [];
    wordWrap = function(string, className) {
      var firstWord, lastWord, measure, results, words;
      measure = function(text) {
        return neo.utils.measureText(text, fixedWidthFont, 10);
      };
      words = string.split(/([^a-zA-Z\d])/);
      firstWord = 0;
      lastWord = 1;
      results = [];
      while (firstWord < words.length) {
        while (lastWord < words.length && measure(words.slice(firstWord, lastWord + 1).join('')) < operatorWidth - operatorPadding * 2) {
          lastWord++;
        }
        details.push({
          className: className,
          value: words.slice(firstWord, lastWord).join('')
        });
        firstWord = lastWord;
        results.push(lastWord = firstWord + 1);
      }
      return results;
    };
    if (identifiers = (ref = operator.identifiers) != null ? ref : (ref1 = operator.KeyNames) != null ? ref1.split(', ') : void 0) {
      wordWrap(identifiers.filter(function(d) {
        return !(/^  /.test(d));
      }).join(', '), 'identifiers');
      details.push({
        className: 'padding'
      });
    }
    if (index = operator.Index) {
      wordWrap(index, 'index');
      details.push({
        className: 'padding'
      });
    }
    if (expression = (ref2 = (ref3 = operator.LegacyExpression) != null ? ref3 : operator.ExpandExpression) != null ? ref2 : operator.LabelName) {
      wordWrap(expression, 'expression');
      details.push({
        className: 'padding'
      });
    }
    if ((operator.Rows != null) && (operator.EstimatedRows != null)) {
      details.push({
        className: 'estimated-rows',
        key: 'estimated rows',
        value: formatNumber(operator.EstimatedRows)
      });
    }
    if ((operator.DbHits != null) && !operator.alwaysShowCost) {
      details.push({
        className: 'db-hits',
        key: plural('db hit', operator.DbHits || 0),
        value: formatNumber(operator.DbHits || 0)
      });
    }
    if (details.length && details[details.length - 1].className === 'padding') {
      details.pop();
    }
    y = operatorDetailHeight;
    for (j = 0, len = details.length; j < len; j++) {
      detail = details[j];
      detail.y = y;
      y += detail.className === 'padding' ? operatorPadding * 2 : operatorDetailHeight;
    }
    return details;
  };
  transform = function(queryPlan) {
    var collectLinks, links, operators, result;
    operators = [];
    links = [];
    result = {
      operatorType: 'Result',
      children: [queryPlan.root]
    };
    collectLinks = function(operator, rank) {
      var child, j, len, ref, results;
      operators.push(operator);
      operator.rank = rank;
      ref = operator.children;
      results = [];
      for (j = 0, len = ref.length; j < len; j++) {
        child = ref[j];
        child.parent = operator;
        collectLinks(child, rank + 1);
        results.push(links.push({
          source: child,
          target: operator
        }));
      }
      return results;
    };
    collectLinks(result, 0);
    return [operators, links];
  };
  layout = function(operators, links) {
    var alpha, center, child, childrenWidth, collide, costHeight, currentY, height, iterations, j, k, l, len, len1, len2, len3, len4, link, linkWidth, m, n, operator, operatorHeight, rank, ranks, ref, ref1, relaxDownwards, relaxUpwards, tx, width;
    costHeight = (function() {
      var scale;
      scale = d3.scale.log().domain([
        1, Math.max(d3.max(operators, function(operator) {
          return operator.DbHits || 0;
        }), maxComparableDbHits)
      ]).range([0, maxCostHeight]);
      return function(operator) {
        var ref;
        return scale(((ref = operator.DbHits) != null ? ref : 0) + 1);
      };
    })();
    operatorHeight = function(operator) {
      var height;
      height = operatorHeaderHeight;
      if (operator.expanded) {
        height += operatorDetails(operator).slice(-1)[0].y + operatorPadding * 2;
      }
      height += costHeight(operator);
      return height;
    };
    linkWidth = (function() {
      var scale;
      scale = d3.scale.log().domain([
        1, Math.max(d3.max(operators, function(operator) {
          return rows(operator) + 1;
        }), maxComparableRows)
      ]).range([2, (operatorWidth - operatorCornerRadius * 2) / maxChildOperators]);
      return function(operator) {
        return scale(rows(operator) + 1);
      };
    })();
    for (j = 0, len = operators.length; j < len; j++) {
      operator = operators[j];
      operator.height = operatorHeight(operator);
      operator.costHeight = costHeight(operator);
      if (operator.costHeight > operatorDetailHeight + operatorPadding) {
        operator.alwaysShowCost = true;
      }
      childrenWidth = d3.sum(operator.children, linkWidth);
      tx = (operatorWidth - childrenWidth) / 2;
      ref = operator.children;
      for (k = 0, len1 = ref.length; k < len1; k++) {
        child = ref[k];
        child.tx = tx;
        tx += linkWidth(child);
      }
    }
    for (l = 0, len2 = links.length; l < len2; l++) {
      link = links[l];
      link.width = linkWidth(link.source);
    }
    ranks = d3.nest().key(function(operator) {
      return operator.rank;
    }).entries(operators);
    currentY = 0;
    for (m = 0, len3 = ranks.length; m < len3; m++) {
      rank = ranks[m];
      currentY -= d3.max(rank.values, operatorHeight) + rankMargin;
      ref1 = rank.values;
      for (n = 0, len4 = ref1.length; n < len4; n++) {
        operator = ref1[n];
        operator.x = 0;
        operator.y = currentY;
      }
    }
    width = d3.max(ranks.map(function(rank) {
      return rank.values.length * (operatorWidth + operatorMargin);
    }));
    height = -currentY;
    collide = function() {
      var dx, i, lastOperator, len5, len6, p, q, ref2, results, x0;
      results = [];
      for (p = 0, len5 = ranks.length; p < len5; p++) {
        rank = ranks[p];
        x0 = 0;
        ref2 = rank.values;
        for (q = 0, len6 = ref2.length; q < len6; q++) {
          operator = ref2[q];
          dx = x0 - operator.x;
          if (dx > 0) {
            operator.x += dx;
          }
          x0 = operator.x + operatorWidth + operatorMargin;
        }
        dx = x0 - operatorMargin - width;
        if (dx > 0) {
          lastOperator = rank.values[rank.values.length - 1];
          x0 = lastOperator.x -= dx;
          results.push((function() {
            var r, ref3, results1;
            results1 = [];
            for (i = r = ref3 = rank.values.length - 2; r >= 0; i = r += -1) {
              operator = rank.values[i];
              dx = operator.x + operatorWidth + operatorMargin - x0;
              if (dx > 0) {
                operator.x -= operatorWidth;
                results1.push(x0 = operator.x);
              } else {
                results1.push(void 0);
              }
            }
            return results1;
          })());
        } else {
          results.push(void 0);
        }
      }
      return results;
    };
    center = function(operator) {
      return operator.x + operatorWidth / 2;
    };
    relaxUpwards = function(alpha) {
      var len5, p, results, x;
      results = [];
      for (p = 0, len5 = ranks.length; p < len5; p++) {
        rank = ranks[p];
        results.push((function() {
          var len6, q, ref2, results1;
          ref2 = rank.values;
          results1 = [];
          for (q = 0, len6 = ref2.length; q < len6; q++) {
            operator = ref2[q];
            if (operator.children.length) {
              x = d3.sum(operator.children, function(child) {
                return linkWidth(child) * center(child);
              }) / d3.sum(operator.children, linkWidth);
              results1.push(operator.x += (x - center(operator)) * alpha);
            } else {
              results1.push(void 0);
            }
          }
          return results1;
        })());
      }
      return results;
    };
    relaxDownwards = function(alpha) {
      var len5, p, ref2, results;
      ref2 = ranks.slice().reverse();
      results = [];
      for (p = 0, len5 = ref2.length; p < len5; p++) {
        rank = ref2[p];
        results.push((function() {
          var len6, q, ref3, results1;
          ref3 = rank.values;
          results1 = [];
          for (q = 0, len6 = ref3.length; q < len6; q++) {
            operator = ref3[q];
            if (operator.parent) {
              results1.push(operator.x += (center(operator.parent) - center(operator)) * alpha);
            } else {
              results1.push(void 0);
            }
          }
          return results1;
        })());
      }
      return results;
    };
    collide();
    iterations = 300;
    alpha = 1;
    while (iterations--) {
      relaxUpwards(alpha);
      collide();
      relaxDownwards(alpha);
      collide();
      alpha *= .98;
    }
    width = d3.max(operators, function(o) {
      return o.x;
    }) - d3.min(operators, function(o) {
      return o.x;
    }) + operatorWidth;
    return [width, height];
  };
  render = function(operators, links, width, height, redisplay) {
    var join, svg;
    svg = d3.select(element);
    svg.transition().attr('width', width + margin * 2).attr('height', height + margin * 2).attr('viewBox', [
      d3.min(operators, function(o) {
        return o.x;
      }) - margin, -margin - height, width + margin * 2, height + margin * 2
    ].join(' '));
    join = function(parent, children) {
      var child, j, len, ref, results, selection;
      ref = d3.entries(children);
      results = [];
      for (j = 0, len = ref.length; j < len; j++) {
        child = ref[j];
        selection = parent.selectAll(child.key).data(child.value.data);
        child.value.selections(selection.enter(), selection, selection.exit());
        if (child.value.children) {
          results.push(join(selection, child.value.children));
        } else {
          results.push(void 0);
        }
      }
      return results;
    };
    return join(svg, {
      'g.layer.links': {
        data: [links],
        selections: function(enter) {
          return enter.append('g').attr('class', 'layer links');
        },
        children: {
          '.link': {
            data: (function(d) {
              return d;
            }),
            selections: function(enter) {
              return enter.append('g').attr('class', 'link');
            },
            children: {
              'path': {
                data: function(d) {
                  return [d];
                },
                selections: function(enter, update) {
                  enter.append('path').attr('fill', linkColor);
                  return update.transition().attr('d', function(d) {
                    var control1, control2, controlWidth, curvature, sourceX, sourceY, targetX, targetY, yi;
                    width = Math.max(1, d.width);
                    sourceX = d.source.x + operatorWidth / 2;
                    targetX = d.target.x + d.source.tx;
                    sourceY = d.source.y + d.source.height;
                    targetY = d.target.y;
                    yi = d3.interpolateNumber(sourceY, targetY);
                    curvature = .5;
                    control1 = yi(curvature);
                    control2 = yi(1 - curvature);
                    controlWidth = Math.min(width / Math.PI, (targetY - sourceY) / Math.PI);
                    if (sourceX > targetX + width / 2) {
                      controlWidth *= -1;
                    }
                    return ['M', sourceX + width / 2, sourceY, 'C', sourceX + width / 2, control1 - controlWidth, targetX + width, control2 - controlWidth, targetX + width, targetY, 'L', targetX, targetY, 'C', targetX, control2 + controlWidth, sourceX - width / 2, control1 + controlWidth, sourceX - width / 2, sourceY, 'Z'].join(' ');
                  });
                }
              },
              'text': {
                data: function(d) {
                  var caption, key, ref, source, x, y;
                  x = d.source.x + operatorWidth / 2;
                  y = d.source.y + d.source.height + operatorDetailHeight;
                  source = d.source;
                  if ((source.Rows != null) || (source.EstimatedRows != null)) {
                    ref = source.Rows != null ? ['Rows', 'row'] : ['EstimatedRows', 'estimated row'], key = ref[0], caption = ref[1];
                    return [
                      {
                        x: x,
                        y: y,
                        text: formatNumber(source[key]) + '\u00A0',
                        anchor: 'end'
                      }, {
                        x: x,
                        y: y,
                        text: plural(caption, source[key]),
                        anchor: 'start'
                      }
                    ];
                  } else {
                    return [];
                  }
                },
                selections: function(enter, update) {
                  enter.append('text').attr('font-size', detailFontSize).attr('font-family', standardFont);
                  return update.transition().attr('x', function(d) {
                    return d.x;
                  }).attr('y', function(d) {
                    return d.y;
                  }).attr('text-anchor', function(d) {
                    return d.anchor;
                  }).text(function(d) {
                    return d.text;
                  });
                }
              }
            }
          }
        }
      },
      'g.layer.operators': {
        data: [operators],
        selections: function(enter) {
          return enter.append('g').attr('class', 'layer operators');
        },
        children: {
          '.operator': {
            data: (function(d) {
              return d;
            }),
            selections: function(enter, update) {
              enter.append('g').attr('class', 'operator');
              return update.transition().attr('transform', function(d) {
                return "translate(" + d.x + "," + d.y + ")";
              });
            },
            children: {
              'rect.background': {
                data: function(d) {
                  return [d];
                },
                selections: function(enter, update) {
                  enter.append('rect').attr('class', 'background');
                  return update.transition().attr('width', operatorWidth).attr('height', function(d) {
                    return d.height;
                  }).attr('rx', operatorCornerRadius).attr('ry', operatorCornerRadius).attr('fill', 'white').style('stroke', 'none');
                }
              },
              'g.header': {
                data: function(d) {
                  return [d];
                },
                selections: function(enter) {
                  return enter.append('g').attr('class', 'header').attr('pointer-events', 'all').on('click', function(d) {
                    d.expanded = !d.expanded;
                    return redisplay();
                  });
                },
                children: {
                  'path.banner': {
                    data: function(d) {
                      return [d];
                    },
                    selections: function(enter, update) {
                      enter.append('path').attr('class', 'banner');
                      return update.attr('d', function(d) {
                        var shaving;
                        shaving = d.height <= operatorHeaderHeight ? operatorCornerRadius : d.height < operatorHeaderHeight + operatorCornerRadius ? operatorCornerRadius - Math.sqrt(Math.pow(operatorCornerRadius, 2) - Math.pow(operatorCornerRadius - d.height + operatorHeaderHeight, 2)) : 0;
                        return ['M', operatorWidth - operatorCornerRadius, 0, 'A', operatorCornerRadius, operatorCornerRadius, 0, 0, 1, operatorWidth, operatorCornerRadius, 'L', operatorWidth, operatorHeaderHeight - operatorCornerRadius, 'A', operatorCornerRadius, operatorCornerRadius, 0, 0, 1, operatorWidth - shaving, operatorHeaderHeight, 'L', shaving, operatorHeaderHeight, 'A', operatorCornerRadius, operatorCornerRadius, 0, 0, 1, 0, operatorHeaderHeight - operatorCornerRadius, 'L', 0, operatorCornerRadius, 'A', operatorCornerRadius, operatorCornerRadius, 0, 0, 1, operatorCornerRadius, 0, 'Z'].join(' ');
                      }).style('fill', function(d) {
                        return color(d.operatorType).color;
                      });
                    }
                  },
                  'path.expand': {
                    data: function(d) {
                      if (d.operatorType === 'Result') {
                        return [];
                      } else {
                        return [d];
                      }
                    },
                    selections: function(enter, update) {
                      var rotateForExpand;
                      rotateForExpand = function(d) {
                        d3.transform();
                        return ("translate(" + (operatorHeaderHeight / 2) + ", " + (operatorHeaderHeight / 2) + ") ") + ("rotate(" + (d.expanded ? 90 : 0) + ") ") + "scale(0.5)";
                      };
                      enter.append('path').attr('class', 'expand').attr('fill', function(d) {
                        return color(d.operatorType)['text-color-internal'];
                      }).attr('d', 'M -5 -10 L 8.66 0 L -5 10 Z').attr('transform', rotateForExpand);
                      return update.transition().attrTween('transform', function(d, i, a) {
                        return d3.interpolateString(a, rotateForExpand(d));
                      });
                    }
                  },
                  'text.title': {
                    data: function(d) {
                      return [d];
                    },
                    selections: function(enter) {
                      return enter.append('text').attr('class', 'title').attr('font-size', operatorHeaderFontSize).attr('font-family', standardFont).attr('x', operatorHeaderHeight).attr('y', 13).attr('fill', function(d) {
                        return color(d.operatorType)['text-color-internal'];
                      }).text(function(d) {
                        return d.operatorType;
                      });
                    }
                  }
                }
              },
              'g.detail': {
                data: operatorDetails,
                selections: function(enter, update, exit) {
                  enter.append('g');
                  update.attr('class', function(d) {
                    return 'detail ' + d.className;
                  }).attr('transform', function(d) {
                    return "translate(0, " + (operatorHeaderHeight + d.y) + ")";
                  }).attr('font-family', function(d) {
                    if (d.className === 'expression' || d.className === 'identifiers') {
                      return fixedWidthFont;
                    } else {
                      return standardFont;
                    }
                  });
                  return exit.remove();
                },
                children: {
                  'text': {
                    data: function(d) {
                      if (d.key) {
                        return [
                          {
                            text: d.value + '\u00A0',
                            anchor: 'end',
                            x: operatorWidth / 2
                          }, {
                            text: d.key,
                            anchor: 'start',
                            x: operatorWidth / 2
                          }
                        ];
                      } else {
                        return [
                          {
                            text: d.value,
                            anchor: 'start',
                            x: operatorPadding
                          }
                        ];
                      }
                    },
                    selections: function(enter, update, exit) {
                      enter.append('text').attr('font-size', detailFontSize);
                      update.attr('x', function(d) {
                        return d.x;
                      }).attr('text-anchor', function(d) {
                        return d.anchor;
                      }).attr('fill', 'black').transition().each('end', function() {
                        return update.text(function(d) {
                          return d.text;
                        });
                      });
                      return exit.remove();
                    }
                  },
                  'path.divider': {
                    data: function(d) {
                      if (d.className === 'padding') {
                        return [d];
                      } else {
                        return [];
                      }
                    },
                    selections: function(enter, update) {
                      enter.append('path').attr('class', 'divider').attr('visibility', 'hidden');
                      return update.attr('d', ['M', 0, -operatorPadding * 2, 'L', operatorWidth, -operatorPadding * 2].join(' ')).attr('stroke', dividerColor).transition().each('end', function() {
                        return update.attr('visibility', 'visible');
                      });
                    }
                  }
                }
              },
              'path.cost': {
                data: function(d) {
                  return [d];
                },
                selections: function(enter, update) {
                  enter.append('path').attr('class', 'cost').attr('fill', costColor);
                  return update.transition().attr('d', function(d) {
                    var shaving;
                    if (d.costHeight < operatorCornerRadius) {
                      shaving = operatorCornerRadius - Math.sqrt(Math.pow(operatorCornerRadius, 2) - Math.pow(operatorCornerRadius - d.costHeight, 2));
                      return ['M', operatorWidth - shaving, d.height - d.costHeight, 'A', operatorCornerRadius, operatorCornerRadius, 0, 0, 1, operatorWidth - operatorCornerRadius, d.height, 'L', operatorCornerRadius, d.height, 'A', operatorCornerRadius, operatorCornerRadius, 0, 0, 1, shaving, d.height - d.costHeight, 'Z'].join(' ');
                    } else {
                      return ['M', 0, d.height - d.costHeight, 'L', operatorWidth, d.height - d.costHeight, 'L', operatorWidth, d.height - operatorCornerRadius, 'A', operatorCornerRadius, operatorCornerRadius, 0, 0, 1, operatorWidth - operatorCornerRadius, d.height, 'L', operatorCornerRadius, d.height, 'A', operatorCornerRadius, operatorCornerRadius, 0, 0, 1, 0, d.height - operatorCornerRadius, 'Z'].join(' ');
                    }
                  });
                }
              },
              'text.cost': {
                data: function(d) {
                  var y;
                  if (d.alwaysShowCost) {
                    y = d.height - d.costHeight + operatorDetailHeight;
                    return [
                      {
                        text: formatNumber(d.DbHits) + '\u00A0',
                        anchor: 'end',
                        y: y
                      }, {
                        text: 'db hits',
                        anchor: 'start',
                        y: y
                      }
                    ];
                  } else {
                    return [];
                  }
                },
                selections: function(enter, update) {
                  enter.append('text').attr('class', 'cost').attr('font-size', detailFontSize).attr('font-family', standardFont).attr('fill', 'white');
                  return update.attr('x', operatorWidth / 2).attr('text-anchor', function(d) {
                    return d.anchor;
                  }).transition().attr('y', function(d) {
                    return d.y;
                  }).each('end', function() {
                    return update.text(function(d) {
                      return d.text;
                    });
                  });
                }
              },
              'rect.outline': {
                data: function(d) {
                  return [d];
                },
                selections: function(enter, update) {
                  enter.append('rect').attr('class', 'outline');
                  return update.transition().attr('width', operatorWidth).attr('height', function(d) {
                    return d.height;
                  }).attr('rx', operatorCornerRadius).attr('ry', operatorCornerRadius).attr('fill', 'none').attr('stroke-width', 1).style('stroke', function(d) {
                    return color(d.operatorType)['border-color'];
                  });
                }
              }
            }
          }
        }
      }
    });
  };
  display = function(queryPlan) {
    var height, links, operators, ref, ref1, width;
    ref = transform(queryPlan), operators = ref[0], links = ref[1];
    ref1 = layout(operators, links), width = ref1[0], height = ref1[1];
    return render(operators, links, width, height, function() {
      return display(queryPlan);
    });
  };
  this.display = display;
  return this;
};


/*!
Copyright (c) 2002-2016 "Neo Technology,"
Network Engine for Objects in Lund AB [http://neotechnology.com]

This file is part of Neo4j.

Neo4j is free software: you can redistribute it and/or modify
it under the terms of the GNU General Public License as published by
the Free Software Foundation, either version 3 of the License, or
(at your option) any later version.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
GNU General Public License for more details.

You should have received a copy of the GNU General Public License
along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */
'use strict';
var hasProp = {}.hasOwnProperty;

neo.models.Relationship = (function() {
  function Relationship(id, source, target, type, properties) {
    var key, value;
    this.id = id;
    this.source = source;
    this.target = target;
    this.type = type;
    this.propertyMap = properties;
    this.propertyList = (function() {
      var ref, results;
      ref = this.propertyMap;
      results = [];
      for (key in ref) {
        if (!hasProp.call(ref, key)) continue;
        value = ref[key];
        results.push({
          key: key,
          value: value
        });
      }
      return results;
    }).call(this);
  }

  Relationship.prototype.toJSON = function() {
    return this.propertyMap;
  };

  Relationship.prototype.isNode = false;

  Relationship.prototype.isRelationship = true;

  Relationship.prototype.isLoop = function() {
    return this.source === this.target;
  };

  return Relationship;

})();


/*!
Copyright (c) 2002-2016 "Neo Technology,"
Network Engine for Objects in Lund AB [http://neotechnology.com]

This file is part of Neo4j.

Neo4j is free software: you can redistribute it and/or modify
it under the terms of the GNU General Public License as published by
the Free Software Foundation, either version 3 of the License, or
(at your option) any later version.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
GNU General Public License for more details.

You should have received a copy of the GNU General Public License
along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */
'use strict';
neo.Renderer = (function() {
  function Renderer(opts) {
    if (opts == null) {
      opts = {};
    }
    neo.utils.extend(this, opts);
    if (this.onGraphChange == null) {
      this.onGraphChange = function() {};
    }
    if (this.onTick == null) {
      this.onTick = function() {};
    }
  }

  return Renderer;

})();


/*!
Copyright (c) 2002-2016 "Neo Technology,"
Network Engine for Objects in Lund AB [http://neotechnology.com]

This file is part of Neo4j.

Neo4j is free software: you can redistribute it and/or modify
it under the terms of the GNU General Public License as published by
the Free Software Foundation, either version 3 of the License, or
(at your option) any later version.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
GNU General Public License for more details.

You should have received a copy of the GNU General Public License
along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */
'use strict';
neo.style = (function() {
  var GraphStyle, Selector, StyleElement, StyleRule, _style;
  _style = function(storage) {
    return new GraphStyle(storage);
  };
  _style.defaults = {
    autoColor: true,
    colors: [
      {
        color: '#DFE1E3',
        'border-color': '#D4D6D7',
        'text-color-internal': '#000000'
      }, {
        color: '#F25A29',
        'border-color': '#DC4717',
        'text-color-internal': '#FFFFFF'
      }, {
        color: '#AD62CE',
        'border-color': '#9453B1',
        'text-color-internal': '#FFFFFF'
      }, {
        color: '#30B6AF',
        'border-color': '#46A39E',
        'text-color-internal': '#FFFFFF'
      }, {
        color: '#FF6C7C',
        'border-color': '#EB5D6C',
        'text-color-internal': '#FFFFFF'
      }, {
        color: '#FCC940',
        'border-color': '#F3BA25',
        'text-color-internal': '#000000'
      }, {
        color: '#4356C0',
        'border-color': '#3445A2',
        'text-color-internal': '#FFFFFF'
      }
    ],
    style: {
      'node': {
        'diameter': '40px',
        'color': '#DFE1E3',
        'border-color': '#D4D6D7',
        'border-width': '2px',
        'text-color-internal': '#000000',
        'caption': '{id}',
        'font-size': '10px'
      },
      'relationship': {
        'color': '#D4D6D7',
        'shaft-width': '1px',
        'font-size': '8px',
        'padding': '3px',
        'text-color-external': '#000000',
        'text-color-internal': '#FFFFFF'
      }
    },
    sizes: [
      {
        diameter: '10px'
      }, {
        diameter: '20px'
      }, {
        diameter: '30px'
      }, {
        diameter: '50px'
      }, {
        diameter: '80px'
      }
    ],
    arrayWidths: [
      {
        'shaft-width': '1px'
      }, {
        'shaft-width': '2px'
      }, {
        'shaft-width': '3px'
      }, {
        'shaft-width': '5px'
      }, {
        'shaft-width': '8px'
      }, {
        'shaft-width': '13px'
      }, {
        'shaft-width': '25px'
      }, {
        'shaft-width': '38px'
      }
    ]
  };
  Selector = (function() {
    function Selector(selector) {
      var ref;
      ref = selector.indexOf('.') > 0 ? selector.split('.') : [selector, void 0], this.tag = ref[0], this.klass = ref[1];
    }

    Selector.prototype.toString = function() {
      var str;
      str = this.tag;
      if (this.klass != null) {
        str += "." + this.klass;
      }
      return str;
    };

    return Selector;

  })();
  StyleRule = (function() {
    function StyleRule(selector1, props1) {
      this.selector = selector1;
      this.props = props1;
    }

    StyleRule.prototype.matches = function(selector) {
      if (this.selector.tag === selector.tag) {
        if (this.selector.klass === selector.klass || !this.selector.klass) {
          return true;
        }
      }
      return false;
    };

    StyleRule.prototype.matchesExact = function(selector) {
      return this.selector.tag === selector.tag && this.selector.klass === selector.klass;
    };

    return StyleRule;

  })();
  StyleElement = (function() {
    function StyleElement(selector, data1) {
      this.data = data1;
      this.selector = selector;
      this.props = {};
    }

    StyleElement.prototype.applyRules = function(rules) {
      var i, j, len, len1, rule;
      for (i = 0, len = rules.length; i < len; i++) {
        rule = rules[i];
        if (!(rule.matches(this.selector))) {
          continue;
        }
        neo.utils.extend(this.props, rule.props);
        break;
      }
      for (j = 0, len1 = rules.length; j < len1; j++) {
        rule = rules[j];
        if (!(rule.matchesExact(this.selector))) {
          continue;
        }
        neo.utils.extend(this.props, rule.props);
        break;
      }
      return this;
    };

    StyleElement.prototype.get = function(attr) {
      return this.props[attr] || '';
    };

    return StyleElement;

  })();
  GraphStyle = (function() {
    function GraphStyle(storage1) {
      this.storage = storage1;
      this.rules = [];
      this.loadRules();
    }

    GraphStyle.prototype.selector = function(item) {
      if (item.isNode) {
        return this.nodeSelector(item);
      } else if (item.isRelationship) {
        return this.relationshipSelector(item);
      }
    };

    GraphStyle.prototype.calculateStyle = function(selector, data) {
      return new StyleElement(selector, data).applyRules(this.rules);
    };

    GraphStyle.prototype.forEntity = function(item) {
      return this.calculateStyle(this.selector(item), item);
    };

    GraphStyle.prototype.forNode = function(node) {
      var ref, selector;
      if (node == null) {
        node = {};
      }
      selector = this.nodeSelector(node);
      if (((ref = node.labels) != null ? ref.length : void 0) > 0) {
        this.setDefaultStyling(selector);
      }
      return this.calculateStyle(selector, node);
    };

    GraphStyle.prototype.forRelationship = function(rel) {
      return this.calculateStyle(this.relationshipSelector(rel), rel);
    };

    GraphStyle.prototype.findAvailableDefaultColor = function() {
      var defaultColor, i, j, len, len1, ref, ref1, rule, usedColors;
      usedColors = {};
      ref = this.rules;
      for (i = 0, len = ref.length; i < len; i++) {
        rule = ref[i];
        if (rule.props.color != null) {
          usedColors[rule.props.color] = true;
        }
      }
      ref1 = _style.defaults.colors;
      for (j = 0, len1 = ref1.length; j < len1; j++) {
        defaultColor = ref1[j];
        if (usedColors[defaultColor.color] == null) {
          return neo.utils.copy(defaultColor);
        }
      }
      return neo.utils.copy(_style.defaults.colors[0]);
    };

    GraphStyle.prototype.setDefaultStyling = function(selector) {
      var rule;
      rule = this.findRule(selector);
      if (_style.defaults.autoColor && (rule == null)) {
        rule = new StyleRule(selector, this.findAvailableDefaultColor());
        this.rules.push(rule);
        return this.persist();
      }
    };

    GraphStyle.prototype.change = function(item, props) {
      var rule, selector;
      selector = this.selector(item);
      rule = this.findRule(selector);
      if (rule == null) {
        rule = new StyleRule(selector, {});
        this.rules.push(rule);
      }
      neo.utils.extend(rule.props, props);
      this.persist();
      return rule;
    };

    GraphStyle.prototype.destroyRule = function(rule) {
      var idx;
      idx = this.rules.indexOf(rule);
      if (idx != null) {
        this.rules.splice(idx, 1);
      }
      return this.persist();
    };

    GraphStyle.prototype.findRule = function(selector) {
      var i, len, r, ref, rule;
      ref = this.rules;
      for (i = 0, len = ref.length; i < len; i++) {
        r = ref[i];
        if (r.matchesExact(selector)) {
          rule = r;
        }
      }
      return rule;
    };

    GraphStyle.prototype.nodeSelector = function(node) {
      var ref, selector;
      if (node == null) {
        node = {};
      }
      selector = 'node';
      if (((ref = node.labels) != null ? ref.length : void 0) > 0) {
        selector += "." + node.labels[0];
      }
      return new Selector(selector);
    };

    GraphStyle.prototype.relationshipSelector = function(rel) {
      var selector;
      if (rel == null) {
        rel = {};
      }
      selector = 'relationship';
      if (rel.type != null) {
        selector += "." + rel.type;
      }
      return new Selector(selector);
    };

    GraphStyle.prototype.importGrass = function(string) {
      var e, rules;
      try {
        rules = this.parse(string);
        this.loadRules(rules);
        return this.persist();
      } catch (_error) {
        e = _error;
      }
    };

    GraphStyle.prototype.loadRules = function(data) {
      var props, rule;
      if (!neo.utils.isObject(data)) {
        data = _style.defaults.style;
      }
      this.rules.length = 0;
      for (rule in data) {
        props = data[rule];
        this.rules.push(new StyleRule(new Selector(rule), neo.utils.copy(props)));
      }
      return this;
    };

    GraphStyle.prototype.parse = function(string) {
      var c, chars, i, insideProps, insideString, j, k, key, keyword, len, len1, prop, props, ref, ref1, rules, skipThis, v, val;
      chars = string.split('');
      insideString = false;
      insideProps = false;
      keyword = "";
      props = "";
      rules = {};
      for (i = 0, len = chars.length; i < len; i++) {
        c = chars[i];
        skipThis = true;
        switch (c) {
          case "{":
            if (!insideString) {
              insideProps = true;
            } else {
              skipThis = false;
            }
            break;
          case "}":
            if (!insideString) {
              insideProps = false;
              rules[keyword] = props;
              keyword = "";
              props = "";
            } else {
              skipThis = false;
            }
            break;
          case "'":
          case "\"":
            insideString ^= true;
            break;
          default:
            skipThis = false;
        }
        if (skipThis) {
          continue;
        }
        if (insideProps) {
          props += c;
        } else {
          if (!c.match(/[\s\n]/)) {
            keyword += c;
          }
        }
      }
      for (k in rules) {
        v = rules[k];
        rules[k] = {};
        ref = v.split(';');
        for (j = 0, len1 = ref.length; j < len1; j++) {
          prop = ref[j];
          ref1 = prop.split(':'), key = ref1[0], val = ref1[1];
          if (!(key && val)) {
            continue;
          }
          rules[k][key != null ? key.trim() : void 0] = val != null ? val.trim() : void 0;
        }
      }
      return rules;
    };

    GraphStyle.prototype.persist = function() {
      var ref;
      return (ref = this.storage) != null ? ref.add('grass', JSON.stringify(this.toSheet())) : void 0;
    };

    GraphStyle.prototype.resetToDefault = function() {
      this.loadRules();
      return this.persist();
    };

    GraphStyle.prototype.toSheet = function() {
      var i, len, ref, rule, sheet;
      sheet = {};
      ref = this.rules;
      for (i = 0, len = ref.length; i < len; i++) {
        rule = ref[i];
        sheet[rule.selector.toString()] = rule.props;
      }
      return sheet;
    };

    GraphStyle.prototype.toString = function() {
      var i, k, len, r, ref, ref1, str, v;
      str = "";
      ref = this.rules;
      for (i = 0, len = ref.length; i < len; i++) {
        r = ref[i];
        str += r.selector.toString() + " {\n";
        ref1 = r.props;
        for (k in ref1) {
          v = ref1[k];
          if (k === "caption") {
            v = "'" + v + "'";
          }
          str += "  " + k + ": " + v + ";\n";
        }
        str += "}\n\n";
      }
      return str;
    };

    GraphStyle.prototype.nextDefaultColor = 0;

    GraphStyle.prototype.defaultColors = function() {
      return neo.utils.copy(_style.defaults.colors);
    };

    GraphStyle.prototype.interpolate = function(str, id, properties) {
      return str.replace(/\{([^{}]*)\}/g, function(a, b) {
        var r;
        r = properties[b] || id;
        if (typeof r === 'string' || typeof r === 'number') {
          return r;
        } else {
          return a;
        }
      });
    };

    return GraphStyle;

  })();
  return _style;
})();


/*!
Copyright (c) 2002-2016 "Neo Technology,"
Network Engine for Objects in Lund AB [http://neotechnology.com]

This file is part of Neo4j.

Neo4j is free software: you can redistribute it and/or modify
it under the terms of the GNU General Public License as published by
the Free Software Foundation, either version 3 of the License, or
(at your option) any later version.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
GNU General Public License for more details.

You should have received a copy of the GNU General Public License
along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */
'use strict';
var slice = [].slice;

neo.viz = function(el, measureSize, graph, layout, style) {
  var base_group, clickHandler, container, currentStats, draw, force, geometry, interpolateZoom, isZoomingIn, layoutDimension, newStatsBucket, now, onNodeClick, onNodeDblClick, onNodeDragToggle, onNodeMouseOut, onNodeMouseOver, onRelMouseOut, onRelMouseOver, onRelationshipClick, rect, render, root, updateViz, viz, zoomBehavior, zoomClick, zoomInClick, zoomLevel, zoomOutClick, zoomed;
  viz = {
    style: style
  };
  root = d3.select(el);
  base_group = root.append('g').attr("transform", "translate(0,0)");
  rect = base_group.append("rect").style("fill", "none").style("pointer-events", "all").attr('x', '-2500').attr('y', '-2500').attr('width', '5000').attr('height', '5000').attr('transform', 'scale(1)');
  container = base_group.append('g');
  geometry = new NeoD3Geometry(style);
  draw = false;
  layoutDimension = 200;
  updateViz = true;
  viz.trigger = function() {
    var args, event;
    event = arguments[0], args = 2 <= arguments.length ? slice.call(arguments, 1) : [];
  };
  onNodeClick = (function(_this) {
    return function(node) {
      updateViz = false;
      return viz.trigger('nodeClicked', node);
    };
  })(this);
  onNodeDblClick = (function(_this) {
    return function(node) {
      return viz.trigger('nodeDblClicked', node);
    };
  })(this);
  onNodeDragToggle = function(node) {
    return viz.trigger('nodeDragToggle', node);
  };
  onRelationshipClick = (function(_this) {
    return function(relationship) {
      d3.event.stopPropagation();
      updateViz = false;
      return viz.trigger('relationshipClicked', relationship);
    };
  })(this);
  onNodeMouseOver = function(node) {
    return viz.trigger('nodeMouseOver', node);
  };
  onNodeMouseOut = function(node) {
    return viz.trigger('nodeMouseOut', node);
  };
  onRelMouseOver = function(rel) {
    return viz.trigger('relMouseOver', rel);
  };
  onRelMouseOut = function(rel) {
    return viz.trigger('relMouseOut', rel);
  };
  zoomLevel = null;
  zoomed = function() {
    draw = true;
    return container.attr("transform", "translate(" + zoomBehavior.translate() + ")" + "scale(" + zoomBehavior.scale() + ")");
  };
  zoomBehavior = d3.behavior.zoom().scaleExtent([0.2, 1]).on("zoom", zoomed);
  interpolateZoom = function(translate, scale) {
    return d3.transition().duration(500).tween("zoom", function() {
      var s, t;
      t = d3.interpolate(zoomBehavior.translate(), translate);
      s = d3.interpolate(zoomBehavior.scale(), scale);
      return function(a) {
        zoomBehavior.scale(s(a)).translate(t(a));
        return zoomed();
      };
    });
  };
  isZoomingIn = true;
  zoomInClick = function() {
    isZoomingIn = true;
    return zoomClick(this);
  };
  zoomOutClick = function() {
    isZoomingIn = false;
    return zoomClick(this);
  };
  zoomClick = function(element) {
    draw = true;
    d3.event.preventDefault;
    d3.select(element.parentNode).selectAll("button").classed('faded', false);
    if (isZoomingIn) {
      zoomLevel = Number((zoomBehavior.scale() * (1 + 0.2 * 1)).toFixed(2));
      if (zoomLevel >= zoomBehavior.scaleExtent()[1]) {
        d3.select(element).classed("faded", true);
        return interpolateZoom(zoomBehavior.translate(), zoomBehavior.scaleExtent()[1]);
      } else {
        return interpolateZoom(zoomBehavior.translate(), zoomLevel);
      }
    } else {
      zoomLevel = Number((zoomBehavior.scale() * (1 + 0.2 * -1)).toFixed(2));
      if (zoomLevel <= zoomBehavior.scaleExtent()[0]) {
        d3.select(element).classed("faded", true);
        return interpolateZoom(zoomBehavior.translate(), zoomBehavior.scaleExtent()[0]);
      } else {
        return interpolateZoom(zoomBehavior.translate(), zoomLevel);
      }
    }
  };
  rect.on('click', function() {
    if (!draw) {
      return viz.trigger('canvasClicked', el);
    }
  });
  base_group.call(zoomBehavior).on("dblclick.zoom", null).on("click.zoom", function() {
    return draw = false;
  }).on("DOMMouseScroll.zoom", null).on("wheel.zoom", null).on("mousewheel.zoom", null);
  newStatsBucket = function() {
    var bucket;
    bucket = {
      frameCount: 0,
      geometry: 0,
      relationshipRenderers: (function() {
        var timings;
        timings = {};
        neo.renderers.relationship.forEach(function(r) {
          return timings[r.name] = 0;
        });
        return timings;
      })()
    };
    bucket.duration = function() {
      return bucket.lastFrame - bucket.firstFrame;
    };
    bucket.fps = function() {
      return (1000 * bucket.frameCount / bucket.duration()).toFixed(1);
    };
    bucket.lps = function() {
      return (1000 * bucket.layout.layoutSteps / bucket.duration()).toFixed(1);
    };
    bucket.top = function() {
      var name, ref, renderers, time, totalRenderTime;
      renderers = [];
      ref = bucket.relationshipRenderers;
      for (name in ref) {
        time = ref[name];
        renderers.push({
          name: name,
          time: time
        });
      }
      renderers.push({
        name: 'forceLayout',
        time: bucket.layout.layoutTime
      });
      renderers.sort(function(a, b) {
        return b.time - a.time;
      });
      totalRenderTime = renderers.reduce((function(prev, current) {
        return prev + current.time;
      }), 0);
      return renderers.map(function(d) {
        return d.name + ": " + ((100 * d.time / totalRenderTime).toFixed(1)) + "%";
      }).join(', ');
    };
    return bucket;
  };
  currentStats = newStatsBucket();
  now = window.performance && window.performance.now ? function() {
    return window.performance.now();
  } : function() {
    return Date.now();
  };
  render = function() {
    var i, j, len, len1, nodeGroups, ref, ref1, relationshipGroups, renderer, startRender, startRenderer;
    if (!currentStats.firstFrame) {
      currentStats.firstFrame = now();
    }
    currentStats.frameCount++;
    startRender = now();
    geometry.onTick(graph);
    currentStats.geometry += now() - startRender;
    nodeGroups = container.selectAll('g.node').attr('transform', function(d) {
      return "translate(" + d.x + "," + d.y + ")";
    });
    ref = neo.renderers.node;
    for (i = 0, len = ref.length; i < len; i++) {
      renderer = ref[i];
      nodeGroups.call(renderer.onTick, viz);
    }
    relationshipGroups = container.selectAll('g.relationship').attr('transform', function(d) {
      return "translate(" + d.source.x + " " + d.source.y + ") rotate(" + (d.naturalAngle + 180) + ")";
    });
    ref1 = neo.renderers.relationship;
    for (j = 0, len1 = ref1.length; j < len1; j++) {
      renderer = ref1[j];
      startRenderer = now();
      relationshipGroups.call(renderer.onTick, viz);
      currentStats.relationshipRenderers[renderer.name] += now() - startRenderer;
    }
    return currentStats.lastFrame = now();
  };
  force = layout.init(render);
  force.drag().on('dragstart.node', function(d) {
    return onNodeDragToggle(d);
  }).on('dragend.node', function() {
    return onNodeDragToggle();
  });
  viz.collectStats = function() {
    var latestStats;
    latestStats = currentStats;
    latestStats.layout = force.collectStats();
    currentStats = newStatsBucket();
    return latestStats;
  };
  viz.update = function() {
    var i, j, k, layers, len, len1, len2, nodeGroups, nodes, ref, ref1, ref2, relationshipGroups, relationships, renderer;
    if (!graph) {
      return;
    }
    layers = container.selectAll("g.layer").data(["relationships", "nodes"]);
    layers.enter().append("g").attr("class", function(d) {
      return "layer " + d;
    });
    nodes = graph.nodes();
    relationships = graph.relationships();
    relationshipGroups = container.select("g.layer.relationships").selectAll("g.relationship").data(relationships, function(d) {
      return d.id;
    });
    relationshipGroups.enter().append("g").attr("class", "relationship").on("mousedown", onRelationshipClick).on('mouseover', onRelMouseOver).on('mouseout', onRelMouseOut);
    relationshipGroups.classed("selected", function(relationship) {
      return relationship.selected;
    });
    geometry.onGraphChange(graph);
    ref = neo.renderers.relationship;
    for (i = 0, len = ref.length; i < len; i++) {
      renderer = ref[i];
      relationshipGroups.call(renderer.onGraphChange, viz);
    }
    relationshipGroups.exit().remove();
    nodeGroups = container.select("g.layer.nodes").selectAll("g.node").data(nodes, function(d) {
      return d.id;
    });
    nodeGroups.enter().append("g").attr("class", "node").call(force.drag).call(clickHandler).on('mouseover', onNodeMouseOver).on('mouseout', onNodeMouseOut);
    nodeGroups.classed("selected", function(node) {
      return node.selected;
    });
    ref1 = neo.renderers.node;
    for (j = 0, len1 = ref1.length; j < len1; j++) {
      renderer = ref1[j];
      nodeGroups.call(renderer.onGraphChange, viz);
    }
    ref2 = neo.renderers.menu;
    for (k = 0, len2 = ref2.length; k < len2; k++) {
      renderer = ref2[k];
      nodeGroups.call(renderer.onGraphChange, viz);
    }
    nodeGroups.exit().remove();
    if (updateViz) {
      force.update(graph, [layoutDimension, layoutDimension]);
      viz.resize();
      viz.trigger('updated');
    }
    return updateViz = true;
  };
  viz.resize = function() {
    var size;
    size = measureSize();
    return root.attr('viewBox', [0, (layoutDimension - size.height) / 2, layoutDimension, size.height].join(' '));
  };
  viz.boundingBox = function() {
    return container.node().getBBox();
  };
  clickHandler = neo.utils.clickHandler();
  clickHandler.on('click', onNodeClick);
  clickHandler.on('dblclick', onNodeDblClick);
  d3.select(root.node().parentNode).select('button.zoom_in').on('click', zoomInClick);
  d3.select(root.node().parentNode).select('button.zoom_out').on('click', zoomOutClick);
  return viz;
};


/*!
Copyright (c) 2002-2016 "Neo Technology,"
Network Engine for Objects in Lund AB [http://neotechnology.com]

This file is part of Neo4j.

Neo4j is free software: you can redistribute it and/or modify
it under the terms of the GNU General Public License as published by
the Free Software Foundation, either version 3 of the License, or
(at your option) any later version.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
GNU General Public License for more details.

You should have received a copy of the GNU General Public License
along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */
'use strict';
var hasProp = {}.hasOwnProperty;

neo.utils.adjacentAngles = (function() {
  function adjacentAngles() {}

  adjacentAngles.prototype.findRuns = function(angleList, minSeparation) {
    var end, extendEnd, extendStart, key, minStart, p, runs, scanForDensePair, start, step, stepCount, tooDense, value;
    p = 0;
    start = 0;
    end = 0;
    runs = [];
    minStart = function() {
      if (runs.length === 0) {
        return 0;
      } else {
        return runs[0].start;
      }
    };
    scanForDensePair = function() {
      start = p;
      end = angleList.wrapIndex(p + 1);
      if (end === minStart()) {
        return 'done';
      } else {
        p = end;
        if (tooDense(start, end)) {
          return extendEnd;
        } else {
          return scanForDensePair;
        }
      }
    };
    extendEnd = function() {
      if (p === minStart()) {
        return 'done';
      } else if (tooDense(start, angleList.wrapIndex(p + 1))) {
        end = angleList.wrapIndex(p + 1);
        p = end;
        return extendEnd;
      } else {
        p = start;
        return extendStart;
      }
    };
    extendStart = function() {
      var candidateStart;
      candidateStart = angleList.wrapIndex(p - 1);
      if (tooDense(candidateStart, end) && candidateStart !== end) {
        start = candidateStart;
        p = start;
        return extendStart;
      } else {
        runs.push({
          start: start,
          end: end
        });
        p = end;
        return scanForDensePair;
      }
    };
    tooDense = function(start, end) {
      var run;
      run = {
        start: start,
        end: end
      };
      return angleList.angle(run) < angleList.length(run) * minSeparation;
    };
    stepCount = 0;
    step = scanForDensePair;
    while (step !== 'done') {
      if (stepCount++ > angleList.totalLength() * 10) {
        console.log('Warning: failed to layout arrows', ((function() {
          var ref, results;
          ref = angleList.list;
          results = [];
          for (key in ref) {
            if (!hasProp.call(ref, key)) continue;
            value = ref[key];
            results.push(key + ": " + value.angle);
          }
          return results;
        })()).join('\n'), minSeparation);
        break;
      }
      step = step();
    }
    return runs;
  };

  return adjacentAngles;

})();


/*!
Copyright (c) 2002-2016 "Neo Technology,"
Network Engine for Objects in Lund AB [http://neotechnology.com]

This file is part of Neo4j.

Neo4j is free software: you can redistribute it and/or modify
it under the terms of the GNU General Public License as published by
the Free Software Foundation, either version 3 of the License, or
(at your option) any later version.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
GNU General Public License for more details.

You should have received a copy of the GNU General Public License
along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */
'use strict';
neo.utils.angleList = (function() {
  function angleList(list) {
    this.list = list;
  }

  angleList.prototype.getAngle = function(index) {
    return this.list[index].angle;
  };

  angleList.prototype.fixed = function(index) {
    return this.list[index].fixed;
  };

  angleList.prototype.totalLength = function() {
    return this.list.length;
  };

  angleList.prototype.length = function(run) {
    if (run.start < run.end) {
      return run.end - run.start;
    } else {
      return run.end + this.list.length - run.start;
    }
  };

  angleList.prototype.angle = function(run) {
    if (run.start < run.end) {
      return this.list[run.end].angle - this.list[run.start].angle;
    } else {
      return 360 - (this.list[run.start].angle - this.list[run.end].angle);
    }
  };

  angleList.prototype.wrapIndex = function(index) {
    if (index === -1) {
      return this.list.length - 1;
    } else if (index >= this.list.length) {
      return index - this.list.length;
    } else {
      return index;
    }
  };

  return angleList;

})();


/*!
Copyright (c) 2002-2016 "Neo Technology,"
Network Engine for Objects in Lund AB [http://neotechnology.com]

This file is part of Neo4j.

Neo4j is free software: you can redistribute it and/or modify
it under the terms of the GNU General Public License as published by
the Free Software Foundation, either version 3 of the License, or
(at your option) any later version.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
GNU General Public License for more details.

You should have received a copy of the GNU General Public License
along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */
'use strict';
neo.utils.arcArrow = (function() {
  function arcArrow(startRadius, endRadius, endCentre, deflection, arrowWidth, headWidth, headLength, captionLayout) {
    var angleTangent, arcRadius, c1, c2, coord, cx, cy, deflectionRadians, endAngle, endAttach, endNormal, endOverlayCorner, endTangent, g1, g2, headRadius, homotheticCenter, intersectWithOtherCircle, midShaftAngle, negativeSweep, positiveSweep, radiusRatio, shaftRadius, square, startAngle, startAttach, startTangent, sweepAngle;
    this.deflection = deflection;
    square = function(l) {
      return l * l;
    };
    deflectionRadians = this.deflection * Math.PI / 180;
    startAttach = {
      x: Math.cos(deflectionRadians) * startRadius,
      y: Math.sin(deflectionRadians) * startRadius
    };
    radiusRatio = startRadius / (endRadius + headLength);
    homotheticCenter = -endCentre * radiusRatio / (1 - radiusRatio);
    intersectWithOtherCircle = function(fixedPoint, radius, xCenter, polarity) {
      var A, B, C, gradient, hc, intersection;
      gradient = fixedPoint.y / (fixedPoint.x - homotheticCenter);
      hc = fixedPoint.y - gradient * fixedPoint.x;
      A = 1 + square(gradient);
      B = 2 * (gradient * hc - xCenter);
      C = square(hc) + square(xCenter) - square(radius);
      intersection = {
        x: (-B + polarity * Math.sqrt(square(B) - 4 * A * C)) / (2 * A)
      };
      intersection.y = (intersection.x - homotheticCenter) * gradient;
      return intersection;
    };
    endAttach = intersectWithOtherCircle(startAttach, endRadius + headLength, endCentre, -1);
    g1 = -startAttach.x / startAttach.y;
    c1 = startAttach.y + (square(startAttach.x) / startAttach.y);
    g2 = -(endAttach.x - endCentre) / endAttach.y;
    c2 = endAttach.y + (endAttach.x - endCentre) * endAttach.x / endAttach.y;
    cx = (c1 - c2) / (g2 - g1);
    cy = g1 * cx + c1;
    arcRadius = Math.sqrt(square(cx - startAttach.x) + square(cy - startAttach.y));
    startAngle = Math.atan2(startAttach.x - cx, cy - startAttach.y);
    endAngle = Math.atan2(endAttach.x - cx, cy - endAttach.y);
    sweepAngle = endAngle - startAngle;
    if (this.deflection > 0) {
      sweepAngle = 2 * Math.PI - sweepAngle;
    }
    this.shaftLength = sweepAngle * arcRadius;
    if (startAngle > endAngle) {
      this.shaftLength = 0;
    }
    midShaftAngle = (startAngle + endAngle) / 2;
    if (this.deflection > 0) {
      midShaftAngle += Math.PI;
    }
    this.midShaftPoint = {
      x: cx + arcRadius * Math.sin(midShaftAngle),
      y: cy - arcRadius * Math.cos(midShaftAngle)
    };
    startTangent = function(dr) {
      var dx, dy;
      dx = (dr < 0 ? 1 : -1) * Math.sqrt(square(dr) / (1 + square(g1)));
      dy = g1 * dx;
      return {
        x: startAttach.x + dx,
        y: startAttach.y + dy
      };
    };
    endTangent = function(dr) {
      var dx, dy;
      dx = (dr < 0 ? -1 : 1) * Math.sqrt(square(dr) / (1 + square(g2)));
      dy = g2 * dx;
      return {
        x: endAttach.x + dx,
        y: endAttach.y + dy
      };
    };
    angleTangent = function(angle, dr) {
      return {
        x: cx + (arcRadius + dr) * Math.sin(angle),
        y: cy - (arcRadius + dr) * Math.cos(angle)
      };
    };
    endNormal = function(dc) {
      var dx, dy;
      dx = (dc < 0 ? -1 : 1) * Math.sqrt(square(dc) / (1 + square(1 / g2)));
      dy = dx / g2;
      return {
        x: endAttach.x + dx,
        y: endAttach.y - dy
      };
    };
    endOverlayCorner = function(dr, dc) {
      var arrowTip, shoulder;
      shoulder = endTangent(dr);
      arrowTip = endNormal(dc);
      return {
        x: shoulder.x + arrowTip.x - endAttach.x,
        y: shoulder.y + arrowTip.y - endAttach.y
      };
    };
    coord = function(point) {
      return point.x + "," + point.y;
    };
    shaftRadius = arrowWidth / 2;
    headRadius = headWidth / 2;
    positiveSweep = startAttach.y > 0 ? 0 : 1;
    negativeSweep = startAttach.y < 0 ? 0 : 1;
    this.outline = function(shortCaptionLength) {
      var captionSweep, endBreak, startBreak;
      if (startAngle > endAngle) {
        return ['M', coord(endTangent(-headRadius)), 'L', coord(endNormal(headLength)), 'L', coord(endTangent(headRadius)), 'Z'].join(' ');
      }
      if (captionLayout === 'external') {
        captionSweep = shortCaptionLength / arcRadius;
        if (this.deflection > 0) {
          captionSweep *= -1;
        }
        startBreak = midShaftAngle - captionSweep / 2;
        endBreak = midShaftAngle + captionSweep / 2;
        return ['M', coord(startTangent(shaftRadius)), 'L', coord(startTangent(-shaftRadius)), 'A', arcRadius - shaftRadius, arcRadius - shaftRadius, 0, 0, positiveSweep, coord(angleTangent(startBreak, -shaftRadius)), 'L', coord(angleTangent(startBreak, shaftRadius)), 'A', arcRadius + shaftRadius, arcRadius + shaftRadius, 0, 0, negativeSweep, coord(startTangent(shaftRadius)), 'Z', 'M', coord(angleTangent(endBreak, shaftRadius)), 'L', coord(angleTangent(endBreak, -shaftRadius)), 'A', arcRadius - shaftRadius, arcRadius - shaftRadius, 0, 0, positiveSweep, coord(endTangent(-shaftRadius)), 'L', coord(endTangent(-headRadius)), 'L', coord(endNormal(headLength)), 'L', coord(endTangent(headRadius)), 'L', coord(endTangent(shaftRadius)), 'A', arcRadius + shaftRadius, arcRadius + shaftRadius, 0, 0, negativeSweep, coord(angleTangent(endBreak, shaftRadius))].join(' ');
      } else {
        return ['M', coord(startTangent(shaftRadius)), 'L', coord(startTangent(-shaftRadius)), 'A', arcRadius - shaftRadius, arcRadius - shaftRadius, 0, 0, positiveSweep, coord(endTangent(-shaftRadius)), 'L', coord(endTangent(-headRadius)), 'L', coord(endNormal(headLength)), 'L', coord(endTangent(headRadius)), 'L', coord(endTangent(shaftRadius)), 'A', arcRadius + shaftRadius, arcRadius + shaftRadius, 0, 0, negativeSweep, coord(startTangent(shaftRadius))].join(' ');
      }
    };
    this.overlay = function(minWidth) {
      var radius;
      radius = Math.max(minWidth / 2, shaftRadius);
      return ['M', coord(startTangent(radius)), 'L', coord(startTangent(-radius)), 'A', arcRadius - radius, arcRadius - radius, 0, 0, positiveSweep, coord(endTangent(-radius)), 'L', coord(endOverlayCorner(-radius, headLength)), 'L', coord(endOverlayCorner(radius, headLength)), 'L', coord(endTangent(radius)), 'A', arcRadius + radius, arcRadius + radius, 0, 0, negativeSweep, coord(startTangent(radius))].join(' ');
    };
  }

  return arcArrow;

})();


/*!
Copyright (c) 2002-2016 "Neo Technology,"
Network Engine for Objects in Lund AB [http://neotechnology.com]

This file is part of Neo4j.

Neo4j is free software: you can redistribute it and/or modify
it under the terms of the GNU General Public License as published by
the Free Software Foundation, either version 3 of the License, or
(at your option) any later version.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
GNU General Public License for more details.

You should have received a copy of the GNU General Public License
along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */
'use strict';
neo.utils.cloneArray = function(original) {
  var clone, i, idx, len, node;
  clone = new Array(original.length);
  for (idx = i = 0, len = original.length; i < len; idx = ++i) {
    node = original[idx];
    clone[idx] = node;
  }
  return clone;
};


/*!
Copyright (c) 2002-2016 "Neo Technology,"
Network Engine for Objects in Lund AB [http://neotechnology.com]

This file is part of Neo4j.

Neo4j is free software: you can redistribute it and/or modify
it under the terms of the GNU General Public License as published by
the Free Software Foundation, either version 3 of the License, or
(at your option) any later version.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
GNU General Public License for more details.

You should have received a copy of the GNU General Public License
along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */
'use strict';
neo.utils.circularLayout = function(nodes, center, radius) {
  var i, j, k, len, len1, n, node, results, unlocatedNodes;
  unlocatedNodes = [];
  for (j = 0, len = nodes.length; j < len; j++) {
    node = nodes[j];
    if (!((node.x != null) && (node.y != null))) {
      unlocatedNodes.push(node);
    }
  }
  results = [];
  for (i = k = 0, len1 = unlocatedNodes.length; k < len1; i = ++k) {
    n = unlocatedNodes[i];
    n.x = center.x + radius * Math.sin(2 * Math.PI * i / unlocatedNodes.length);
    results.push(n.y = center.y + radius * Math.cos(2 * Math.PI * i / unlocatedNodes.length));
  }
  return results;
};


/*!
Copyright (c) 2002-2016 "Neo Technology,"
Network Engine for Objects in Lund AB [http://neotechnology.com]

This file is part of Neo4j.

Neo4j is free software: you can redistribute it and/or modify
it under the terms of the GNU General Public License as published by
the Free Software Foundation, either version 3 of the License, or
(at your option) any later version.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
GNU General Public License for more details.

You should have received a copy of the GNU General Public License
along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */
'use strict';
neo.utils.distributeCircular = function(arrowAngles, minSeparation) {
  var angle, angleList, center, i, j, k, key, l, len, len1, list, m, moveableRuns, n, o, rawAngle, ref, ref1, ref2, ref3, ref4, ref5, result, run, runLength, runsOfTooDenseArrows, separation, splitByFixedArrows, tooDenseRun, wrapAngle;
  list = [];
  ref = arrowAngles.floating;
  for (key in ref) {
    angle = ref[key];
    list.push({
      key: key,
      angle: angle,
      fixed: false
    });
  }
  ref1 = arrowAngles.fixed;
  for (key in ref1) {
    angle = ref1[key];
    list.push({
      key: key,
      angle: angle,
      fixed: true
    });
  }
  list.sort(function(a, b) {
    return a.angle - b.angle;
  });
  angleList = new neo.utils.angleList(list);
  runsOfTooDenseArrows = new neo.utils.adjacentAngles().findRuns(angleList, minSeparation);
  wrapAngle = function(angle) {
    if (angle >= 360) {
      return angle - 360;
    } else if (angle < 0) {
      return angle + 360;
    } else {
      return angle;
    }
  };
  result = {};
  splitByFixedArrows = function(run) {
    var currentStart, i, j, ref2, runs, wrapped;
    runs = [];
    currentStart = run.start;
    for (i = j = 1, ref2 = angleList.length(run); 1 <= ref2 ? j <= ref2 : j >= ref2; i = 1 <= ref2 ? ++j : --j) {
      wrapped = angleList.wrapIndex(run.start + i);
      if (angleList.fixed(wrapped)) {
        runs.push({
          start: currentStart,
          end: wrapped
        });
        currentStart = wrapped;
      }
    }
    if (!angleList.fixed(run.end)) {
      runs.push({
        start: currentStart,
        end: run.end
      });
    }
    return runs;
  };
  for (j = 0, len = runsOfTooDenseArrows.length; j < len; j++) {
    tooDenseRun = runsOfTooDenseArrows[j];
    moveableRuns = splitByFixedArrows(tooDenseRun);
    for (k = 0, len1 = moveableRuns.length; k < len1; k++) {
      run = moveableRuns[k];
      runLength = angleList.length(run);
      if (angleList.fixed(run.start) && angleList.fixed(run.end)) {
        separation = angleList.angle(run) / runLength;
        for (i = l = 0, ref2 = runLength; 0 <= ref2 ? l <= ref2 : l >= ref2; i = 0 <= ref2 ? ++l : --l) {
          rawAngle = list[run.start].angle + i * separation;
          result[list[angleList.wrapIndex(run.start + i)].key] = wrapAngle(rawAngle);
        }
      } else if (angleList.fixed(run.start) && !angleList.fixed(run.end)) {
        for (i = m = 0, ref3 = runLength; 0 <= ref3 ? m <= ref3 : m >= ref3; i = 0 <= ref3 ? ++m : --m) {
          rawAngle = list[run.start].angle + i * minSeparation;
          result[list[angleList.wrapIndex(run.start + i)].key] = wrapAngle(rawAngle);
        }
      } else if (!angleList.fixed(run.start) && angleList.fixed(run.end)) {
        for (i = n = 0, ref4 = runLength; 0 <= ref4 ? n <= ref4 : n >= ref4; i = 0 <= ref4 ? ++n : --n) {
          rawAngle = list[run.end].angle - (runLength - i) * minSeparation;
          result[list[angleList.wrapIndex(run.start + i)].key] = wrapAngle(rawAngle);
        }
      } else {
        center = list[run.start].angle + angleList.angle(run) / 2;
        for (i = o = 0, ref5 = runLength; 0 <= ref5 ? o <= ref5 : o >= ref5; i = 0 <= ref5 ? ++o : --o) {
          rawAngle = center + (i - runLength / 2) * minSeparation;
          result[list[angleList.wrapIndex(run.start + i)].key] = wrapAngle(rawAngle);
        }
      }
    }
  }
  for (key in arrowAngles.floating) {
    if (!result.hasOwnProperty(key)) {
      result[key] = arrowAngles.floating[key];
    }
  }
  for (key in arrowAngles.fixed) {
    if (!result.hasOwnProperty(key)) {
      result[key] = arrowAngles.fixed[key];
    }
  }
  return result;
};


/*!
Copyright (c) 2002-2016 "Neo Technology,"
Network Engine for Objects in Lund AB [http://neotechnology.com]

This file is part of Neo4j.

Neo4j is free software: you can redistribute it and/or modify
it under the terms of the GNU General Public License as published by
the Free Software Foundation, either version 3 of the License, or
(at your option) any later version.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
GNU General Public License for more details.

You should have received a copy of the GNU General Public License
along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */
'use strict';
neo.utils.circumferentialRelationshipRouting = (function() {
  function circumferentialRelationshipRouting(style) {
    this.style = style;
  }

  circumferentialRelationshipRouting.prototype.measureRelationshipCaption = function(relationship, caption) {
    var fontFamily, fontSize, padding;
    fontFamily = 'sans-serif';
    fontSize = parseFloat(this.style.forRelationship(relationship).get('font-size'));
    padding = parseFloat(this.style.forRelationship(relationship).get('padding'));
    return neo.utils.measureText(caption, fontFamily, fontSize) + padding * 2;
  };

  circumferentialRelationshipRouting.prototype.captionFitsInsideArrowShaftWidth = function(relationship) {
    return parseFloat(this.style.forRelationship(relationship).get('shaft-width')) > parseFloat(this.style.forRelationship(relationship).get('font-size'));
  };

  circumferentialRelationshipRouting.prototype.measureRelationshipCaptions = function(relationships) {
    var i, len, relationship, results;
    results = [];
    for (i = 0, len = relationships.length; i < len; i++) {
      relationship = relationships[i];
      relationship.captionLength = this.measureRelationshipCaption(relationship, relationship.type);
      results.push(relationship.captionLayout = this.captionFitsInsideArrowShaftWidth(relationship) ? "internal" : "external");
    }
    return results;
  };

  circumferentialRelationshipRouting.prototype.shortenCaption = function(relationship, caption, targetWidth) {
    var shortCaption, width;
    shortCaption = caption;
    while (true) {
      if (shortCaption.length <= 2) {
        return ['', 0];
      }
      shortCaption = shortCaption.substr(0, shortCaption.length - 2) + '\u2026';
      width = this.measureRelationshipCaption(relationship, shortCaption);
      if (width < targetWidth) {
        return [shortCaption, width];
      }
    }
  };

  circumferentialRelationshipRouting.prototype.layoutRelationships = function(graph) {
    var angle, arrowAngles, centreDistance, deflection, distributedAngles, dx, dy, headHeight, headRadius, i, id, j, k, l, len, len1, len2, len3, node, ref, ref1, ref2, ref3, relationship, relationshipMap, relationships, results, shaftRadius, sortedNodes, square;
    ref = graph.relationships();
    for (i = 0, len = ref.length; i < len; i++) {
      relationship = ref[i];
      dx = relationship.target.x - relationship.source.x;
      dy = relationship.target.y - relationship.source.y;
      relationship.naturalAngle = ((Math.atan2(dy, dx) / Math.PI * 180) + 180) % 360;
      delete relationship.arrow;
    }
    sortedNodes = graph.nodes().sort(function(a, b) {
      return b.relationshipCount(graph) - a.relationshipCount(graph);
    });
    results = [];
    for (j = 0, len1 = sortedNodes.length; j < len1; j++) {
      node = sortedNodes[j];
      relationships = [];
      ref1 = graph.relationships();
      for (k = 0, len2 = ref1.length; k < len2; k++) {
        relationship = ref1[k];
        if (relationship.source === node || relationship.target === node) {
          relationships.push(relationship);
        }
      }
      arrowAngles = {
        floating: {},
        fixed: {}
      };
      relationshipMap = {};
      for (l = 0, len3 = relationships.length; l < len3; l++) {
        relationship = relationships[l];
        relationshipMap[relationship.id] = relationship;
        if (node === relationship.source) {
          if (relationship.hasOwnProperty('arrow')) {
            arrowAngles.fixed[relationship.id] = relationship.naturalAngle + relationship.arrow.deflection;
          } else {
            arrowAngles.floating[relationship.id] = relationship.naturalAngle;
          }
        }
        if (node === relationship.target) {
          if (relationship.hasOwnProperty('arrow')) {
            arrowAngles.fixed[relationship.id] = (relationship.naturalAngle - relationship.arrow.deflection + 180) % 360;
          } else {
            arrowAngles.floating[relationship.id] = (relationship.naturalAngle + 180) % 360;
          }
        }
      }
      distributedAngles = {};
      ref2 = arrowAngles.floating;
      for (id in ref2) {
        angle = ref2[id];
        distributedAngles[id] = angle;
      }
      ref3 = arrowAngles.fixed;
      for (id in ref3) {
        angle = ref3[id];
        distributedAngles[id] = angle;
      }
      if (relationships.length > 1) {
        distributedAngles = neo.utils.distributeCircular(arrowAngles, 30);
      }
      results.push((function() {
        var ref4, results1;
        results1 = [];
        for (id in distributedAngles) {
          angle = distributedAngles[id];
          relationship = relationshipMap[id];
          if (!relationship.hasOwnProperty('arrow')) {
            deflection = node === relationship.source ? angle - relationship.naturalAngle : (relationship.naturalAngle - angle + 180) % 360;
            shaftRadius = (parseFloat(this.style.forRelationship(relationship).get('shaft-width')) / 2) || 2;
            headRadius = shaftRadius + 3;
            headHeight = headRadius * 2;
            dx = relationship.target.x - relationship.source.x;
            dy = relationship.target.y - relationship.source.y;
            square = function(distance) {
              return distance * distance;
            };
            centreDistance = Math.sqrt(square(dx) + square(dy));
            if (Math.abs(deflection) < Math.PI / 180) {
              relationship.arrow = new neo.utils.straightArrow(relationship.source.radius, relationship.target.radius, centreDistance, shaftRadius, headRadius, headHeight, relationship.captionLayout);
            } else {
              relationship.arrow = new neo.utils.arcArrow(relationship.source.radius, relationship.target.radius, centreDistance, deflection, shaftRadius * 2, headRadius * 2, headHeight, relationship.captionLayout);
            }
            results1.push((ref4 = relationship.arrow.shaftLength > relationship.captionLength ? [relationship.caption, relationship.captionLength] : this.shortenCaption(relationship, relationship.caption, relationship.arrow.shaftLength), relationship.shortCaption = ref4[0], relationship.shortCaptionLength = ref4[1], ref4));
          } else {
            results1.push(void 0);
          }
        }
        return results1;
      }).call(this));
    }
    return results;
  };

  return circumferentialRelationshipRouting;

})();


/*!
Copyright (c) 2002-2016 "Neo Technology,"
Network Engine for Objects in Lund AB [http://neotechnology.com]

This file is part of Neo4j.

Neo4j is free software: you can redistribute it and/or modify
it under the terms of the GNU General Public License as published by
the Free Software Foundation, either version 3 of the License, or
(at your option) any later version.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
GNU General Public License for more details.

You should have received a copy of the GNU General Public License
along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */
'use strict';
neo.utils.clickHandler = function() {
  var cc, event;
  cc = function(selection) {
    var dist, down, last, tolerance, wait;
    dist = function(a, b) {
      return Math.sqrt(Math.pow(a[0] - b[0], 2), Math.pow(a[1] - b[1], 2));
    };
    down = void 0;
    tolerance = 5;
    last = void 0;
    wait = null;
    selection.on("mousedown", function() {
      d3.event.target.__data__.fixed = true;
      down = d3.mouse(document.body);
      last = +new Date();
      return d3.event.stopPropagation();
    });
    return selection.on("mouseup", function() {
      if (dist(down, d3.mouse(document.body)) > tolerance) {

      } else {
        if (wait) {
          window.clearTimeout(wait);
          wait = null;
          return event.dblclick(d3.event.target.__data__);
        } else {
          event.click(d3.event.target.__data__);
          return wait = window.setTimeout((function(e) {
            return function() {
              return wait = null;
            };
          })(d3.event), 250);
        }
      }
    });
  };
  event = d3.dispatch("click", "dblclick");
  return d3.rebind(cc, event, "on");
};


/*!
Copyright (c) 2002-2016 "Neo Technology,"
Network Engine for Objects in Lund AB [http://neotechnology.com]

This file is part of Neo4j.

Neo4j is free software: you can redistribute it and/or modify
it under the terms of the GNU General Public License as published by
the Free Software Foundation, either version 3 of the License, or
(at your option) any later version.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
GNU General Public License for more details.

You should have received a copy of the GNU General Public License
along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */
'use strict';
neo.utils.loopArrow = (function() {
  function loopArrow(nodeRadius, straightLength, spreadDegrees, shaftWidth, headWidth, headLength, captionHeight) {
    var Point, endPoint, loopRadius, normalPoint, r1, r2, r3, shaftRadius, spread, startPoint;
    spread = spreadDegrees * Math.PI / 180;
    r1 = nodeRadius;
    r2 = nodeRadius + headLength;
    r3 = nodeRadius + straightLength;
    loopRadius = r3 * Math.tan(spread / 2);
    shaftRadius = shaftWidth / 2;
    this.shaftLength = loopRadius * 3 + shaftWidth;
    Point = (function() {
      function Point(x, y) {
        this.x = x;
        this.y = y;
      }

      Point.prototype.toString = function() {
        return this.x + " " + this.y;
      };

      return Point;

    })();
    normalPoint = function(sweep, radius, displacement) {
      var cy, localLoopRadius;
      localLoopRadius = radius * Math.tan(spread / 2);
      cy = radius / Math.cos(spread / 2);
      return new Point((localLoopRadius + displacement) * Math.sin(sweep), cy + (localLoopRadius + displacement) * Math.cos(sweep));
    };
    this.midShaftPoint = normalPoint(0, r3, shaftRadius + captionHeight / 2 + 2);
    startPoint = function(radius, displacement) {
      return normalPoint((Math.PI + spread) / 2, radius, displacement);
    };
    endPoint = function(radius, displacement) {
      return normalPoint(-(Math.PI + spread) / 2, radius, displacement);
    };
    this.outline = function() {
      var inner, outer;
      inner = loopRadius - shaftRadius;
      outer = loopRadius + shaftRadius;
      return ['M', startPoint(r1, shaftRadius), 'L', startPoint(r3, shaftRadius), 'A', outer, outer, 0, 1, 1, endPoint(r3, shaftRadius), 'L', endPoint(r2, shaftRadius), 'L', endPoint(r2, -headWidth / 2), 'L', endPoint(r1, 0), 'L', endPoint(r2, headWidth / 2), 'L', endPoint(r2, -shaftRadius), 'L', endPoint(r3, -shaftRadius), 'A', inner, inner, 0, 1, 0, startPoint(r3, -shaftRadius), 'L', startPoint(r1, -shaftRadius), 'Z'].join(' ');
    };
    this.overlay = function(minWidth) {
      var displacement, inner, outer;
      displacement = Math.max(minWidth / 2, shaftRadius);
      inner = loopRadius - displacement;
      outer = loopRadius + displacement;
      return ['M', startPoint(r1, displacement), 'L', startPoint(r3, displacement), 'A', outer, outer, 0, 1, 1, endPoint(r3, displacement), 'L', endPoint(r2, displacement), 'L', endPoint(r2, -displacement), 'L', endPoint(r3, -displacement), 'A', inner, inner, 0, 1, 0, startPoint(r3, -displacement), 'L', startPoint(r1, -displacement), 'Z'].join(' ');
    };
  }

  return loopArrow;

})();


/*!
Copyright (c) 2002-2016 "Neo Technology,"
Network Engine for Objects in Lund AB [http://neotechnology.com]

This file is part of Neo4j.

Neo4j is free software: you can redistribute it and/or modify
it under the terms of the GNU General Public License as published by
the Free Software Foundation, either version 3 of the License, or
(at your option) any later version.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
GNU General Public License for more details.

You should have received a copy of the GNU General Public License
along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */
'use strict';
neo.utils.pairwiseArcsRelationshipRouting = (function() {
  function pairwiseArcsRelationshipRouting(style) {
    this.style = style;
  }

  pairwiseArcsRelationshipRouting.prototype.measureRelationshipCaption = function(relationship, caption) {
    var fontFamily, padding;
    fontFamily = 'sans-serif';
    padding = parseFloat(this.style.forRelationship(relationship).get('padding'));
    return neo.utils.measureText(caption, fontFamily, relationship.captionHeight) + padding * 2;
  };

  pairwiseArcsRelationshipRouting.prototype.captionFitsInsideArrowShaftWidth = function(relationship) {
    return parseFloat(this.style.forRelationship(relationship).get('shaft-width')) > relationship.captionHeight;
  };

  pairwiseArcsRelationshipRouting.prototype.measureRelationshipCaptions = function(relationships) {
    var j, len, relationship, results;
    results = [];
    for (j = 0, len = relationships.length; j < len; j++) {
      relationship = relationships[j];
      relationship.captionHeight = parseFloat(this.style.forRelationship(relationship).get('font-size'));
      relationship.captionLength = this.measureRelationshipCaption(relationship, relationship.caption);
      results.push(relationship.captionLayout = this.captionFitsInsideArrowShaftWidth(relationship) && !relationship.isLoop() ? "internal" : "external");
    }
    return results;
  };

  pairwiseArcsRelationshipRouting.prototype.shortenCaption = function(relationship, caption, targetWidth) {
    var shortCaption, width;
    shortCaption = caption || 'caption';
    while (true) {
      if (shortCaption.length <= 2) {
        return ['', 0];
      }
      shortCaption = shortCaption.substr(0, shortCaption.length - 2) + '\u2026';
      width = this.measureRelationshipCaption(relationship, shortCaption);
      if (width < targetWidth) {
        return [shortCaption, width];
      }
    }
  };

  pairwiseArcsRelationshipRouting.prototype.computeGeometryForNonLoopArrows = function(nodePairs) {
    var angle, centreDistance, dx, dy, j, len, nodePair, relationship, results, square;
    square = function(distance) {
      return distance * distance;
    };
    results = [];
    for (j = 0, len = nodePairs.length; j < len; j++) {
      nodePair = nodePairs[j];
      if (!nodePair.isLoop()) {
        dx = nodePair.nodeA.x - nodePair.nodeB.x;
        dy = nodePair.nodeA.y - nodePair.nodeB.y;
        angle = ((Math.atan2(dy, dx) / Math.PI * 180) + 360) % 360;
        centreDistance = Math.sqrt(square(dx) + square(dy));
        results.push((function() {
          var k, len1, ref, results1;
          ref = nodePair.relationships;
          results1 = [];
          for (k = 0, len1 = ref.length; k < len1; k++) {
            relationship = ref[k];
            relationship.naturalAngle = relationship.target === nodePair.nodeA ? (angle + 180) % 360 : angle;
            results1.push(relationship.centreDistance = centreDistance);
          }
          return results1;
        })());
      } else {
        results.push(void 0);
      }
    }
    return results;
  };

  pairwiseArcsRelationshipRouting.prototype.distributeAnglesForLoopArrows = function(nodePairs, relationships) {
    var angle, angles, biggestGap, end, i, j, k, l, len, len1, len2, node, nodePair, relationship, results, separation, start;
    results = [];
    for (j = 0, len = nodePairs.length; j < len; j++) {
      nodePair = nodePairs[j];
      if (nodePair.isLoop()) {
        angles = [];
        node = nodePair.nodeA;
        for (k = 0, len1 = relationships.length; k < len1; k++) {
          relationship = relationships[k];
          if (!relationship.isLoop()) {
            if (relationship.source === node) {
              angles.push(relationship.naturalAngle);
            }
            if (relationship.target === node) {
              angles.push(relationship.naturalAngle + 180);
            }
          }
        }
        angles = angles.map(function(a) {
          return (a + 360) % 360;
        }).sort(function(a, b) {
          return a - b;
        });
        if (angles.length > 0) {
          biggestGap = {
            start: 0,
            end: 0
          };
          for (i = l = 0, len2 = angles.length; l < len2; i = ++l) {
            angle = angles[i];
            start = angle;
            end = i === angles.length - 1 ? angles[0] + 360 : angles[i + 1];
            if (end - start > biggestGap.end - biggestGap.start) {
              biggestGap.start = start;
              biggestGap.end = end;
            }
          }
          separation = (biggestGap.end - biggestGap.start) / (nodePair.relationships.length + 1);
          results.push((function() {
            var len3, m, ref, results1;
            ref = nodePair.relationships;
            results1 = [];
            for (i = m = 0, len3 = ref.length; m < len3; i = ++m) {
              relationship = ref[i];
              results1.push(relationship.naturalAngle = (biggestGap.start + (i + 1) * separation - 90) % 360);
            }
            return results1;
          })());
        } else {
          separation = 360 / nodePair.relationships.length;
          results.push((function() {
            var len3, m, ref, results1;
            ref = nodePair.relationships;
            results1 = [];
            for (i = m = 0, len3 = ref.length; m < len3; i = ++m) {
              relationship = ref[i];
              results1.push(relationship.naturalAngle = i * separation);
            }
            return results1;
          })());
        }
      } else {
        results.push(void 0);
      }
    }
    return results;
  };

  pairwiseArcsRelationshipRouting.prototype.layoutRelationships = function(graph) {
    var defaultDeflectionStep, deflection, deflectionStep, headHeight, headWidth, i, j, k, len, len1, maximumTotalDeflection, middleRelationshipIndex, nodePair, nodePairs, numberOfSteps, ref, relationship, results, shaftWidth, totalDeflection;
    nodePairs = graph.groupedRelationships();
    this.computeGeometryForNonLoopArrows(nodePairs);
    this.distributeAnglesForLoopArrows(nodePairs, graph.relationships());
    results = [];
    for (j = 0, len = nodePairs.length; j < len; j++) {
      nodePair = nodePairs[j];
      ref = nodePair.relationships;
      for (k = 0, len1 = ref.length; k < len1; k++) {
        relationship = ref[k];
        delete relationship.arrow;
      }
      middleRelationshipIndex = (nodePair.relationships.length - 1) / 2;
      defaultDeflectionStep = 30;
      maximumTotalDeflection = 150;
      numberOfSteps = nodePair.relationships.length - 1;
      totalDeflection = defaultDeflectionStep * numberOfSteps;
      deflectionStep = totalDeflection > maximumTotalDeflection ? maximumTotalDeflection / numberOfSteps : defaultDeflectionStep;
      results.push((function() {
        var l, len2, ref1, ref2, results1;
        ref1 = nodePair.relationships;
        results1 = [];
        for (i = l = 0, len2 = ref1.length; l < len2; i = ++l) {
          relationship = ref1[i];
          shaftWidth = parseFloat(this.style.forRelationship(relationship).get('shaft-width')) || 2;
          headWidth = shaftWidth + 6;
          headHeight = headWidth;
          if (nodePair.isLoop()) {
            relationship.arrow = new neo.utils.loopArrow(relationship.source.radius, 40, defaultDeflectionStep, shaftWidth, headWidth, headHeight, relationship.captionHeight);
          } else {
            if (i === middleRelationshipIndex) {
              relationship.arrow = new neo.utils.straightArrow(relationship.source.radius, relationship.target.radius, relationship.centreDistance, shaftWidth, headWidth, headHeight, relationship.captionLayout);
            } else {
              deflection = deflectionStep * (i - middleRelationshipIndex);
              if (nodePair.nodeA !== relationship.source) {
                deflection *= -1;
              }
              relationship.arrow = new neo.utils.arcArrow(relationship.source.radius, relationship.target.radius, relationship.centreDistance, deflection, shaftWidth, headWidth, headHeight, relationship.captionLayout);
            }
          }
          results1.push((ref2 = relationship.arrow.shaftLength > relationship.captionLength ? [relationship.caption, relationship.captionLength] : this.shortenCaption(relationship, relationship.caption, relationship.arrow.shaftLength), relationship.shortCaption = ref2[0], relationship.shortCaptionLength = ref2[1], ref2));
        }
        return results1;
      }).call(this));
    }
    return results;
  };

  return pairwiseArcsRelationshipRouting;

})();


/*!
Copyright (c) 2002-2016 "Neo Technology,"
Network Engine for Objects in Lund AB [http://neotechnology.com]

This file is part of Neo4j.

Neo4j is free software: you can redistribute it and/or modify
it under the terms of the GNU General Public License as published by
the Free Software Foundation, either version 3 of the License, or
(at your option) any later version.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
GNU General Public License for more details.

You should have received a copy of the GNU General Public License
along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */
'use strict';
neo.utils.straightArrow = (function() {
  function straightArrow(startRadius, endRadius, centreDistance, shaftWidth, headWidth, headHeight, captionLayout) {
    var endArrow, endShaft, headRadius, shaftRadius, startArrow;
    this.length = centreDistance - (startRadius + endRadius);
    this.shaftLength = this.length - headHeight;
    startArrow = startRadius;
    endShaft = startArrow + this.shaftLength;
    endArrow = startArrow + this.length;
    shaftRadius = shaftWidth / 2;
    headRadius = headWidth / 2;
    this.midShaftPoint = {
      x: startArrow + this.shaftLength / 2,
      y: 0
    };
    this.outline = function(shortCaptionLength) {
      var endBreak, startBreak;
      if (captionLayout === "external") {
        startBreak = startArrow + (this.shaftLength - shortCaptionLength) / 2;
        endBreak = endShaft - (this.shaftLength - shortCaptionLength) / 2;
        return ['M', startArrow, shaftRadius, 'L', startBreak, shaftRadius, 'L', startBreak, -shaftRadius, 'L', startArrow, -shaftRadius, 'Z', 'M', endBreak, shaftRadius, 'L', endShaft, shaftRadius, 'L', endShaft, headRadius, 'L', endArrow, 0, 'L', endShaft, -headRadius, 'L', endShaft, -shaftRadius, 'L', endBreak, -shaftRadius, 'Z'].join(' ');
      } else {
        return ['M', startArrow, shaftRadius, 'L', endShaft, shaftRadius, 'L', endShaft, headRadius, 'L', endArrow, 0, 'L', endShaft, -headRadius, 'L', endShaft, -shaftRadius, 'L', startArrow, -shaftRadius, 'Z'].join(' ');
      }
    };
    this.overlay = function(minWidth) {
      var radius;
      radius = Math.max(minWidth / 2, shaftRadius);
      return ['M', startArrow, radius, 'L', endArrow, radius, 'L', endArrow, -radius, 'L', startArrow, -radius, 'Z'].join(' ');
    };
  }

  straightArrow.prototype.deflection = 0;

  return straightArrow;

})();


/*!
Copyright (c) 2002-2016 "Neo Technology,"
Network Engine for Objects in Lund AB [http://neotechnology.com]

This file is part of Neo4j.

Neo4j is free software: you can redistribute it and/or modify
it under the terms of the GNU General Public License as published by
the Free Software Foundation, either version 3 of the License, or
(at your option) any later version.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
GNU General Public License for more details.

You should have received a copy of the GNU General Public License
along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */
'use strict';
neo.utils.measureText = (function() {
  var cache, measureUsingCanvas;
  measureUsingCanvas = function(text, font) {
    var canvas, canvasSelection, context;
    canvasSelection = d3.select('canvas#textMeasurementCanvas').data([this]);
    canvasSelection.enter().append('canvas').attr('id', 'textMeasurementCanvas').style('display', 'none');
    canvas = canvasSelection.node();
    context = canvas.getContext('2d');
    context.font = font;
    return context.measureText(text).width;
  };
  cache = (function() {
    var cacheSize, list, map;
    cacheSize = 10000;
    map = {};
    list = [];
    return function(key, calc) {
      var cached, result;
      cached = map[key];
      if (cached) {
        return cached;
      } else {
        result = calc();
        if (list.length > cacheSize) {
          delete map[list.splice(0, 1)];
          list.push(key);
        }
        return map[key] = result;
      }
    };
  })();
  return function(text, fontFamily, fontSize) {
    var font;
    font = 'normal normal normal ' + fontSize + 'px/normal ' + fontFamily;
    return cache(text + font, function() {
      return measureUsingCanvas(text, font);
    });
  };
})();


/*!
Copyright (c) 2002-2015 "Neo Technology,"
Network Engine for Objects in Lund AB [http://neotechnology.com]

This file is part of Neo4j.

Neo4j is free software: you can redistribute it and/or modify
it under the terms of the GNU General Public License as published by
the Free Software Foundation, either version 3 of the License, or
(at your option) any later version.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
GNU General Public License for more details.

You should have received a copy of the GNU General Public License
along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */
'use strict';
(function() {
  var arrowPath, nodeCaption, nodeOutline, nodeRing, nodeRingStrokeSize, noop, relationshipOverlay, relationshipType;
  noop = function() {};
  nodeRingStrokeSize = 8;
  nodeOutline = new neo.Renderer({
    onGraphChange: function(selection, viz) {
      var circles;
      circles = selection.selectAll('circle.outline').data(function(node) {
        return [node];
      });
      circles.enter().append('circle').classed('outline', true).attr({
        cx: 0,
        cy: 0
      });
      circles.attr({
        r: function(node) {
          return node.radius;
        },
        fill: function(node) {
          return viz.style.forNode(node).get('color');
        },
        stroke: function(node) {
          return viz.style.forNode(node).get('border-color');
        },
        'stroke-width': function(node) {
          return viz.style.forNode(node).get('border-width');
        }
      });
      return circles.exit().remove();
    },
    onTick: noop
  });
  nodeCaption = new neo.Renderer({
    onGraphChange: function(selection, viz) {
      var text;
      text = selection.selectAll('text').data(function(node) {
        return node.caption;
      });
      text.enter().append('text').attr({
        'text-anchor': 'middle'
      }).attr({
        'pointer-events': 'none'
      });
      text.text(function(line) {
        return line.text;
      }).attr('y', function(line) {
        return line.baseline;
      }).attr('font-size', function(line) {
        return viz.style.forNode(line.node).get('font-size');
      }).attr({
        'fill': function(line) {
          return viz.style.forNode(line.node).get('text-color-internal');
        }
      });
      return text.exit().remove();
    },
    onTick: noop
  });
  nodeRing = new neo.Renderer({
    onGraphChange: function(selection) {
      var circles;
      circles = selection.selectAll('circle.ring').data(function(node) {
        return [node];
      });
      circles.enter().insert('circle', '.outline').classed('ring', true).attr({
        cx: 0,
        cy: 0,
        'stroke-width': nodeRingStrokeSize + 'px'
      });
      circles.attr({
        r: function(node) {
          return node.radius + 4;
        }
      });
      return circles.exit().remove();
    },
    onTick: noop
  });
  arrowPath = new neo.Renderer({
    name: 'arrowPath',
    onGraphChange: function(selection, viz) {
      var paths;
      paths = selection.selectAll('path.outline').data(function(rel) {
        return [rel];
      });
      paths.enter().append('path').classed('outline', true);
      paths.attr('fill', function(rel) {
        return viz.style.forRelationship(rel).get('color');
      }).attr('stroke', 'none');
      return paths.exit().remove();
    },
    onTick: function(selection) {
      return selection.selectAll('path').attr('d', function(d) {
        return d.arrow.outline(d.shortCaptionLength);
      });
    }
  });
  relationshipType = new neo.Renderer({
    name: 'relationshipType',
    onGraphChange: function(selection, viz) {
      var texts;
      texts = selection.selectAll("text").data(function(rel) {
        return [rel];
      });
      texts.enter().append("text").attr({
        "text-anchor": "middle"
      }).attr({
        'pointer-events': 'none'
      });
      texts.attr('font-size', function(rel) {
        return viz.style.forRelationship(rel).get('font-size');
      }).attr('fill', function(rel) {
        return viz.style.forRelationship(rel).get('text-color-' + rel.captionLayout);
      });
      return texts.exit().remove();
    },
    onTick: function(selection, viz) {
      return selection.selectAll('text').attr('x', function(rel) {
        return rel.arrow.midShaftPoint.x;
      }).attr('y', function(rel) {
        return rel.arrow.midShaftPoint.y + parseFloat(viz.style.forRelationship(rel).get('font-size')) / 2 - 1;
      }).attr('transform', function(rel) {
        if (rel.naturalAngle < 90 || rel.naturalAngle > 270) {
          return "rotate(180 " + rel.arrow.midShaftPoint.x + " " + rel.arrow.midShaftPoint.y + ")";
        } else {
          return null;
        }
      }).text(function(rel) {
        return rel.shortCaption;
      });
    }
  });
  relationshipOverlay = new neo.Renderer({
    name: 'relationshipOverlay',
    onGraphChange: function(selection) {
      var rects;
      rects = selection.selectAll('path.overlay').data(function(rel) {
        return [rel];
      });
      rects.enter().append('path').classed('overlay', true);
      return rects.exit().remove();
    },
    onTick: function(selection) {
      var band;
      band = 16;
      return selection.selectAll('path.overlay').attr('d', function(d) {
        return d.arrow.overlay(band);
      });
    }
  });
  neo.renderers.node.push(nodeOutline);
  neo.renderers.node.push(nodeCaption);
  neo.renderers.node.push(nodeRing);
  neo.renderers.relationship.push(arrowPath);
  neo.renderers.relationship.push(relationshipType);
  return neo.renderers.relationship.push(relationshipOverlay);
})();


/*!
Copyright (c) 2002-2015 "Neo Technology,"
Network Engine for Objects in Lund AB [http://neotechnology.com]

This file is part of Neo4j.

Neo4j is free software: you can redistribute it and/or modify
it under the terms of the GNU General Public License as published by
the Free Software Foundation, either version 3 of the License, or
(at your option) any later version.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
GNU General Public License for more details.

You should have received a copy of the GNU General Public License
along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */
'use strict';
(function() {
  var arc, attachContextEvent, createMenuItem, donutExpandNode, donutRemoveNode, donutUnlockNode, getSelectedNode, noop, numberOfItemsInContextMenu;
  noop = function() {};
  numberOfItemsInContextMenu = 3;
  arc = function(radius, itemNumber, width) {
    var endAngle, innerRadius, startAngle;
    if (width == null) {
      width = 30;
    }
    itemNumber = itemNumber - 1;
    startAngle = ((2 * Math.PI) / numberOfItemsInContextMenu) * itemNumber;
    endAngle = startAngle + ((2 * Math.PI) / numberOfItemsInContextMenu);
    innerRadius = Math.max(radius + 8, 20);
    return d3.svg.arc().innerRadius(innerRadius).outerRadius(innerRadius + width).startAngle(startAngle).endAngle(endAngle).padAngle(.03);
  };
  getSelectedNode = function(node) {
    if (node.selected) {
      return [node];
    } else {
      return [];
    }
  };
  attachContextEvent = function(event, elems, viz, content, label) {
    var elem, i, len, results;
    results = [];
    for (i = 0, len = elems.length; i < len; i++) {
      elem = elems[i];
      elem.on('mousedown.drag', function() {
        d3.event.stopPropagation();
        return null;
      });
      elem.on('mouseup', function(node) {
        return viz.trigger(event, node);
      });
      elem.on('mouseover', function(node) {
        node.contextMenu = {
          menuSelection: event,
          menuContent: content,
          label: label
        };
        return viz.trigger('menuMouseOver', node);
      });
      results.push(elem.on('mouseout', function(node) {
        delete node.contextMenu;
        return viz.trigger('menuMouseOut', node);
      }));
    }
    return results;
  };
  createMenuItem = function(selection, viz, eventName, itemNumber, className, position, textValue, helpValue) {
    var path, tab, text, textpath;
    path = selection.selectAll('path.' + className).data(getSelectedNode);
    textpath = selection.selectAll('text.' + className).data(getSelectedNode);
    tab = path.enter().append('path').classed(className, true).classed('context-menu-item', true).attr({
      d: function(node) {
        return arc(node.radius, itemNumber, 1)();
      }
    });
    text = textpath.enter().append('text').classed('context-menu-item', true).text(textValue).attr("transform", "scale(0.1)").attr({
      'font-family': 'FontAwesome',
      fill: function(node) {
        return viz.style.forNode(node).get('text-color-internal');
      },
      x: function(node) {
        return arc(node.radius, itemNumber).centroid()[0] + position[0];
      },
      y: function(node) {
        return arc(node.radius, itemNumber).centroid()[1] + position[1];
      }
    });
    attachContextEvent(eventName, [tab, text], viz, helpValue, textValue);
    tab.transition().duration(200).attr({
      d: function(node) {
        return arc(node.radius, itemNumber)();
      }
    });
    text.attr("transform", "scale(1)");
    path.exit().transition().duration(200).attr({
      d: function(node) {
        return arc(node.radius, itemNumber, 1)();
      }
    }).remove();
    return textpath.exit().attr("transform", "scale(0)").remove();
  };
  donutRemoveNode = new neo.Renderer({
    onGraphChange: function(selection, viz) {
      return createMenuItem(selection, viz, 'nodeClose', 1, 'remove_node', [-4, 0], '\uf00d', 'Remove node from the visualization');
    },
    onTick: noop
  });
  donutExpandNode = new neo.Renderer({
    onGraphChange: function(selection, viz) {
      return createMenuItem(selection, viz, 'nodeDblClicked', 2, 'expand_node', [0, 4], '\uf0b2', 'Expand child relationships');
    },
    onTick: noop
  });
  donutUnlockNode = new neo.Renderer({
    onGraphChange: function(selection, viz) {
      return createMenuItem(selection, viz, 'nodeUnlock', 3, 'unlock_node', [4, 0], '\uf09c', 'Unlock the node to re-layout the graph');
    },
    onTick: noop
  });
  neo.renderers.menu.push(donutExpandNode);
  neo.renderers.menu.push(donutRemoveNode);
  return neo.renderers.menu.push(donutUnlockNode);
})();
