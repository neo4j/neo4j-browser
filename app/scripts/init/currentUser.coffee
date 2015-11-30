angular.module('neo4jApp')
.run [
  'CurrentUser'
  '$rootScope'
  (CurrentUser, $rootScope) ->
    $rootScope.$on 'ntn:authenticated', ->
      $rootScope.currentUser = CurrentUser.instance()
]
