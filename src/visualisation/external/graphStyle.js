
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
window.neo = window.neo || {};
neo.graphstyle = (function() {
    var GraphStyle, Selector, StyleElement, StyleRule, provider;
    provider = {};
    provider.defaultStyle = {
      'node': {
        'diameter': '50px',
        'color': '#A5ABB6',
        'border-color': '#9AA1AC',
        'border-width': '2px',
        'text-color-internal': '#FFFFFF',
        'font-size': '10px',
      },
      'relationship': {
        'color': '#A5ABB6',
        'shaft-width': '1px',
        'font-size': '8px',
        'padding': '3px',
        'text-color-external': '#000000',
        'text-color-internal': '#FFFFFF',
        'caption': '<type>'
      }
    };
    provider.defaultSizes = [
      {
        diameter: '10px'
      }, {
        diameter: '20px'
      }, {
        diameter: '50px'
      }, {
        diameter: '65px'
      }, {
        diameter: '80px'
      }
    ];
    provider.defaultArrayWidths = [
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
    ];
    provider.defaultColors = [
      {
        color: '#A5ABB6',
        'border-color': '#9AA1AC',
        'text-color-internal': '#FFFFFF'
      }, {
        color: '#68BDF6',
        'border-color': '#5CA8DB',
        'text-color-internal': '#FFFFFF'
      }, {
        color: '#6DCE9E',
        'border-color': '#60B58B',
        'text-color-internal': '#FFFFFF'
      }, {
        color: '#FF756E',
        'border-color': '#E06760',
        'text-color-internal': '#FFFFFF'
      }, {
        color: '#DE9BF9',
        'border-color': '#BF85D6',
        'text-color-internal': '#FFFFFF'
      }, {
        color: '#FB95AF',
        'border-color': '#E0849B',
        'text-color-internal': '#FFFFFF'
      }, {
        color: '#FFD86E',
        'border-color': '#EDBA39',
        'text-color-internal': '#604A0E'
      }
    ];
    Selector = (function() {
      function Selector(tag1, classes1) {
        this.tag = tag1;
        this.classes = classes1 != null ? classes1 : [];
      }

      Selector.prototype.toString = function() {
        var classs, i, len, ref, str;
        str = this.tag;
        ref = this.classes;
        for (i = 0, len = ref.length; i < len; i++) {
          classs = ref[i];
          if (classs != null) {
            str += "." + classs;
          }
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
        var classs, i, len, ref;
        if (this.selector.tag !== selector.tag) {
          return false;
        }
        ref = this.selector.classes;
        for (i = 0, len = ref.length; i < len; i++) {
          classs = ref[i];
          if ((classs != null) && selector.classes.indexOf(classs) === -1) {
            return false;
          }
        }
        return true;
      };

      StyleRule.prototype.matchesExact = function(selector) {
        return this.matches(selector) && this.selector.classes.length === selector.classes.length;
      };

      return StyleRule;

    })();
    StyleElement = (function() {
      function StyleElement(selector) {
        this.selector = selector;
        this.props = {};
      }

      StyleElement.prototype.applyRules = function(rules) {
        var i, len, rule, that;
        for (i = 0, len = rules.length; i < len; i++) {
          rule = rules[i];
          if (rule.matches(this.selector)) {
            that = this;
            Object.keys(rule.props).forEach(function(key) {
                that.props[key] = rule.props[key];
            })
          }
        }
        return this;
      };

      StyleElement.prototype.get = function(attr) {
        return this.props[attr] || '';
      };

      return StyleElement;

    })();
    GraphStyle = (function() {
      var bolt, parseSelector;

      bolt = window.neo4j.v1;

      function GraphStyle(storage) {
        var e, ref;
        this.storage = storage;
        this.rules = [];
        try {
          this.loadRules((ref = this.storage) != null ? ref.get('grass') : void 0);
        } catch (_error) {
          e = _error;
        }
      }

      GraphStyle.prototype.selector = function(item) {
        if (item.isNode) {
          return this.nodeSelector(item);
        } else if (item.isRelationship) {
          return this.relationshipSelector(item);
        }
      };

      GraphStyle.prototype.newSelector = function(tag, classes) {
        return new Selector(tag, classes);
      };

      GraphStyle.prototype.calculateStyle = function(selector) {
        return new StyleElement(selector).applyRules(this.rules);
      };

      GraphStyle.prototype.forEntity = function(item) {
        return this.calculateStyle(this.selector(item));
      };

      GraphStyle.prototype.forNode = function(node) {
        var ref, selector;
        if (node == null) {
          node = {};
        }
        selector = this.nodeSelector(node);
        if (((ref = node.labels) != null ? ref.length : void 0) > 0) {
          this.setDefaultNodeStyling(selector, node);
        }
        return this.calculateStyle(selector);
      };

      GraphStyle.prototype.forRelationship = function(rel) {
        var selector;
        selector = this.relationshipSelector(rel);
        return this.calculateStyle(selector);
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
        ref1 = provider.defaultColors;
        for (j = 0, len1 = ref1.length; j < len1; j++) {
          defaultColor = ref1[j];
          if (usedColors[defaultColor.color] == null) {
            return defaultColor;
          }
        }
        return provider.defaultColors[0];
      };

      GraphStyle.prototype.setDefaultNodeStyling = function(selector, item) {
        var defaultCaption, defaultColor, i, len, minimalSelector, ref, rule;
        defaultColor = true;
        defaultCaption = true;
        ref = this.rules;
        for (i = 0, len = ref.length; i < len; i++) {
          rule = ref[i];
          if (rule.selector.classes.length > 0 && rule.matches(selector)) {
            if (rule.props.hasOwnProperty('color')) {
              defaultColor = false;
            }
            if (rule.props.hasOwnProperty('caption')) {
              defaultCaption = false;
            }
          }
        }
        minimalSelector = new Selector(selector.tag, selector.classes.sort().slice(0, 1));
        if (defaultColor) {
          this.changeForSelector(minimalSelector, this.findAvailableDefaultColor());
        }
        if (defaultCaption) {
          return this.changeForSelector(minimalSelector, this.getDefaultNodeCaption(item));
        }
      };

      GraphStyle.prototype.getDefaultNodeCaption = function(item) {
        var caption_prio_order, default_caption, ref;
        if (!item || !((ref = item.propertyList) != null ? ref.length : void 0) > 0) {
          return {
            caption: '<id>'
          };
        }
        caption_prio_order = [/^name$/i, /^title$/i, /^label$/i, /name$/i, /description$/i, /^.+/];
        default_caption = caption_prio_order.reduceRight(function(leading, current) {
          var hits;
          hits = item.propertyList.filter(function(prop) {
            return current.test(prop.key);
          });
          if (hits.length) {
            return "{" + hits[0].key + "}";
          } else {
            return leading;
          }
        }, '');
        default_caption || (default_caption = '<id>');
        return {
          caption: default_caption
        };
      };

      GraphStyle.prototype.changeForSelector = function(selector, props) {
        var rule;
        rule = this.findRule(selector);
        if (rule == null) {
          rule = new StyleRule(selector, props);
          this.rules.push(rule);
        }
        Object.keys(props).forEach(function(propKey) {
          rule.props[propKey] = props[propKey]
        })
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
        var i, len, r, ref;
        ref = this.rules;
        for (i = 0, len = ref.length; i < len; i++) {
          r = ref[i];
          if (r.matchesExact(selector)) {
            return r;
          }
        }
        return void 0;
      };

      GraphStyle.prototype.nodeSelector = function(node) {
        var classes;
        if (node == null) {
          node = {};
        }
        classes = node.labels != null ? node.labels : [];
        return new Selector('node', classes);
      };

      GraphStyle.prototype.relationshipSelector = function(rel) {
        var classes;
        if (rel == null) {
          rel = {};
        }
        classes = rel.type != null ? [rel.type] : [];
        return new Selector('relationship', classes);
      };

      GraphStyle.prototype.reloadFromStorage = function() {
        var e, ref;
        try {
          return this.loadRules((ref = this.storage) != null ? ref.get('grass') : void 0);
        } catch (_error) {
          e = _error;
        }
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

      parseSelector = function(key) {
        var tokens;
        tokens = key.split('.');
        return new Selector(tokens[0], tokens.slice(1));
      };

      GraphStyle.prototype.loadRules = function(data) {
        var key, props;
        if (typeof data !== 'object') {
          data = provider.defaultStyle;
        }
        this.rules.length = 0;
        for (key in data) {
          props = data[key];
          this.rules.push(new StyleRule(parseSelector(key), props));
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

      GraphStyle.prototype.defaultSizes = function() {
        return provider.defaultSizes;
      };

      GraphStyle.prototype.defaultArrayWidths = function() {
        return provider.defaultArrayWidths;
      };

      GraphStyle.prototype.defaultColors = function() {
        return provider.defaultColors;
      };

      GraphStyle.prototype.interpolate = function(str, item) {
        var ips;
        ips = str.replace(/\{([^{}]*)\}/g, function(a, b) {
          var r;
          r = item.propertyMap[b];
          if (bolt.isInt(r)) {
            return r.toString();
          }
          if (typeof r === 'object') {
            r = r.join(', ');
          }
          if (typeof r === 'string' || typeof r === 'number') {
            return r;
          } else {
            return '';
          }
        });
        if (ips.length < 1 && str === "{type}" && item.isRelationship) {
          ips = '<type>';
        }
        if (ips.length < 1 && str === "{id}" && item.isNode) {
          ips = '<id>';
        }
        return ips.replace(/^<(id|type)>$/, function(a, b) {
          var r;
          r = item[b];
          if (bolt.isInt(r)) {
            return r.toString();
          }
          if (typeof r === 'string' || typeof r === 'number') {
            return r;
          } else {
            return '';
          }
        });
      };

      return GraphStyle;

    })();
    return new GraphStyle(null);
})()
