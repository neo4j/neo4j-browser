/*
 * Copyright (c) 2002-2018 "Neo4j, Inc"
 * Network Engine for Objects in Lund AB [http://neotechnology.com]
 *
 * This file is part of Neo4j.
 *
 * Neo4j is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */

neo.style = (function () {
  const _style = storage => new GraphStyle(storage)

  _style.defaults = {
    autoColor: true,
    colors: [
      {
        color: '#DFE1E3',
        'border-color': '#D4D6D7',
        'text-color-internal': '#000000'
      },
      {
        color: '#F25A29',
        'border-color': '#DC4717',
        'text-color-internal': '#FFFFFF'
      },
      {
        color: '#AD62CE',
        'border-color': '#9453B1',
        'text-color-internal': '#FFFFFF'
      },
      {
        color: '#30B6AF',
        'border-color': '#46A39E',
        'text-color-internal': '#FFFFFF'
      },
      {
        color: '#FF6C7C',
        'border-color': '#EB5D6C',
        'text-color-internal': '#FFFFFF'
      },
      {
        color: '#FCC940',
        'border-color': '#F3BA25',
        'text-color-internal': '#000000'
      },
      {
        color: '#4356C0',
        'border-color': '#3445A2',
        'text-color-internal': '#FFFFFF'
      }
    ],
    style: {
      node: {
        diameter: '40px',
        color: '#DFE1E3',
        'border-color': '#D4D6D7',
        'border-width': '2px',
        'text-color-internal': '#000000',
        caption: '{id}',
        'font-size': '10px'
      },
      relationship: {
        color: '#D4D6D7',
        'shaft-width': '1px',
        'font-size': '8px',
        padding: '3px',
        'text-color-external': '#000000',
        'text-color-internal': '#FFFFFF'
      }
    },
    sizes: [
      { diameter: '10px' },
      { diameter: '20px' },
      { diameter: '30px' },
      { diameter: '50px' },
      { diameter: '80px' }
    ],
    arrayWidths: [
      { 'shaft-width': '1px' },
      { 'shaft-width': '2px' },
      { 'shaft-width': '3px' },
      { 'shaft-width': '5px' },
      { 'shaft-width': '8px' },
      { 'shaft-width': '13px' },
      { 'shaft-width': '25px' },
      { 'shaft-width': '38px' }
    ]
  }

  class Selector {
    constructor (selector) {
      ;[this.tag, this.klass] = Array.from(
        selector.indexOf('.') > 0 ? selector.split('.') : [selector, undefined]
      )
    }

    toString () {
      let str = this.tag
      if (this.klass != null) {
        str += `.${this.klass}`
      }
      return str
    }
  }

  class StyleRule {
    constructor (selector, props) {
      this.selector = selector
      this.props = props
    }

    matches (selector) {
      if (this.selector.tag === selector.tag) {
        if (this.selector.klass === selector.klass || !this.selector.klass) {
          return true
        }
      }
      return false
    }

    matchesExact (selector) {
      return (
        this.selector.tag === selector.tag &&
        this.selector.klass === selector.klass
      )
    }
  }

  class StyleElement {
    constructor (selector, data) {
      this.data = data
      this.selector = selector
      this.props = {}
    }

    applyRules (rules) {
      // Two passes
      for (var rule of Array.from(rules)) {
        if (rule.matches(this.selector)) {
          neo.utils.extend(this.props, rule.props)
          break
        }
      }
      for (rule of Array.from(rules)) {
        if (rule.matchesExact(this.selector)) {
          neo.utils.extend(this.props, rule.props)
          break
        }
      }
      return this
    }

    get (attr) {
      return this.props[attr] || ''
    }
  }

  class GraphStyle {
    static initClass () {
      //
      // Misc.
      //
      this.prototype.nextDefaultColor = 0
    }
    constructor (storage) {
      this.storage = storage
      this.rules = []
      this.loadRules()
    }

    // Generate a selector string from an object (node or rel)
    selector (item) {
      if (item.isNode) {
        return this.nodeSelector(item)
      } else if (item.isRelationship) {
        return this.relationshipSelector(item)
      }
    }

    //
    // Methods for calculating applied style for elements
    //
    calculateStyle (selector, data) {
      return new StyleElement(selector, data).applyRules(this.rules)
    }

    forEntity (item) {
      return this.calculateStyle(this.selector(item), item)
    }

    forNode (node) {
      if (node == null) {
        node = {}
      }
      const selector = this.nodeSelector(node)
      if ((node.labels != null ? node.labels.length : undefined) > 0) {
        this.setDefaultStyling(selector)
      }
      return this.calculateStyle(selector, node)
    }

    forRelationship (rel) {
      return this.calculateStyle(this.relationshipSelector(rel), rel)
    }

    findAvailableDefaultColor () {
      const usedColors = {}
      for (let rule of Array.from(this.rules)) {
        if (rule.props.color != null) {
          usedColors[rule.props.color] = true
        }
      }

      for (let defaultColor of Array.from(_style.defaults.colors)) {
        if (usedColors[defaultColor.color] == null) {
          return neo.utils.copy(defaultColor)
        }
      }

      return neo.utils.copy(_style.defaults.colors[0])
    }

    setDefaultStyling (selector) {
      let rule = this.findRule(selector)

      if (_style.defaults.autoColor && rule == null) {
        rule = new StyleRule(selector, this.findAvailableDefaultColor())
        this.rules.push(rule)
        return this.persist()
      }
    }

    //
    // Methods for getting and modifying rules
    //
    change (item, props) {
      const selector = this.selector(item)
      let rule = this.findRule(selector)

      if (rule == null) {
        rule = new StyleRule(selector, {})
        this.rules.push(rule)
      }
      neo.utils.extend(rule.props, props)
      this.persist()
      return rule
    }

    destroyRule (rule) {
      const idx = this.rules.indexOf(rule)
      if (idx != null) {
        this.rules.splice(idx, 1)
      }
      return this.persist()
    }

    findRule (selector) {
      let rule
      for (let r of Array.from(this.rules)) {
        if (r.matchesExact(selector)) {
          rule = r
        }
      }
      return rule
    }

    //
    // Selector helpers
    //
    nodeSelector (node) {
      if (node == null) {
        node = {}
      }
      let selector = 'node'
      if ((node.labels != null ? node.labels.length : undefined) > 0) {
        selector += `.${node.labels[0]}`
      }
      return new Selector(selector)
    }

    relationshipSelector (rel) {
      if (rel == null) {
        rel = {}
      }
      let selector = 'relationship'
      if (rel.type != null) {
        selector += `.${rel.type}`
      }
      return new Selector(selector)
    }

    //
    // Import/export
    //

    importGrass (string) {
      try {
        const rules = this.parse(string)
        this.loadRules(rules)
        return this.persist()
      } catch (e) {}
    }

    loadRules (data) {
      if (!neo.utils.isObject(data)) {
        data = _style.defaults.style
      }
      this.rules.length = 0
      for (let rule in data) {
        const props = data[rule]
        this.rules.push(
          new StyleRule(new Selector(rule), neo.utils.copy(props))
        )
      }
      return this
    }

    parse (string) {
      const chars = string.split('')
      let insideString = false
      let insideProps = false
      let keyword = ''
      let props = ''

      const rules = {}

      for (let c of Array.from(chars)) {
        let skipThis = true
        switch (c) {
          case '{':
            if (!insideString) {
              insideProps = true
            } else {
              skipThis = false
            }
            break
          case '}':
            if (!insideString) {
              insideProps = false
              rules[keyword] = props
              keyword = ''
              props = ''
            } else {
              skipThis = false
            }
            break
          case "'":
          case '"':
            insideString ^= true
            break
          default:
            skipThis = false
        }

        if (skipThis) {
          continue
        }

        if (insideProps) {
          props += c
        } else {
          if (!c.match(/[\s\n]/)) {
            keyword += c
          }
        }
      }

      for (let k in rules) {
        const v = rules[k]
        rules[k] = {}
        for (let prop of Array.from(v.split(';'))) {
          const [key, val] = Array.from(prop.split(':'))
          if (!key || !val) {
            continue
          }
          rules[k][key != null ? key.trim() : undefined] =
            val != null ? val.trim() : undefined
        }
      }

      return rules
    }

    persist () {
      return this.storage != null
        ? this.storage.add('grass', JSON.stringify(this.toSheet()))
        : undefined
    }

    resetToDefault () {
      this.loadRules()
      return this.persist()
    }

    toSheet () {
      const sheet = {}
      for (let rule of Array.from(this.rules)) {
        sheet[rule.selector.toString()] = rule.props
      }
      return sheet
    }

    toString () {
      let str = ''
      for (let r of Array.from(this.rules)) {
        str += r.selector.toString() + ' {\n'
        for (let k in r.props) {
          let v = r.props[k]
          if (k === 'caption') {
            v = `'${v}'`
          }
          str += `  ${k}: ${v};\n`
        }
        str += '}\n\n'
      }
      return str
    }
    defaultColors () {
      return neo.utils.copy(_style.defaults.colors)
    }
    interpolate (str, id, properties) {
      // Supplant
      // http://javascript.crockford.com/remedial.html
      return str.replace(/\{([^{}]*)\}/g, function (a, b) {
        const r = properties[b] || id
        if (typeof r === 'string' || typeof r === 'number') {
          return r
        } else {
          return a
        }
      })
    }
  }
  GraphStyle.initClass()

  return _style
})()
