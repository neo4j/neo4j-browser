###!
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
###

'use strict';

angular.module('neo4jApp.directives')
.directive 'rangeSlider', [ ->
  {
    replace: true
    restrict: 'E'
    require: 'ngModel'
    template: '<input type="range"/>'
    link: (scope, element, attrs, ngModel) ->
      ngRangeMin = undefined
      ngRangeMax = undefined
      ngRangeStep = undefined
      value = undefined

      init = ->
        if !angular.isDefined(attrs.ngRangeMin)
          ngRangeMin = 0
        else
          scope.$watch attrs.ngRangeMin, (newValue, oldValue, scope) ->
            if angular.isDefined(newValue)
              ngRangeMin = newValue
              setValue()
            return
        if !angular.isDefined(attrs.ngRangeMax)
          ngRangeMax = 100
        else
          scope.$watch attrs.ngRangeMax, (newValue, oldValue, scope) ->
            if angular.isDefined(newValue)
              ngRangeMax = newValue
              setValue()
            return
        if !angular.isDefined(attrs.ngRangeStep)
          ngRangeStep = 1
        else
          scope.$watch attrs.ngRangeStep, (newValue, oldValue, scope) ->
            if angular.isDefined(newValue)
              ngRangeStep = newValue
              setValue()
            return
        if !angular.isDefined(ngModel)
          value = 50
        else
          scope.$watch (->
            ngModel.$modelValue
          ), (newValue, oldValue, scope) ->
            if angular.isDefined(newValue)
              value = newValue
              setValue()
            return
        if !ngModel
          return
        ngModel.$parsers.push (value) ->
          val = Number(value)
          if val != val
            val = undefined
          val
        return

      setValue = ->
        if angular.isDefined(ngRangeMin) and angular.isDefined(ngRangeMax) and angular.isDefined(ngRangeStep) and angular.isDefined(value)
          element.attr 'min', ngRangeMin
          element.attr 'max', ngRangeMax
          element.attr 'step', ngRangeStep
          element.val value
        return

      read = ->
        if angular.isDefined(ngModel)
          ngModel.$setViewValue value
        return

      element.on 'change', ->
        if angular.isDefined(value) and value != element.val()
          value = element.val()
          scope.$apply read
        return
      init()
      return
  }
 ]
