angular.module('neo4jApp')
.run [
  '$rootScope'
  'UsageDataCollectionService'
  ($rootScope, UDC) ->
    $rootScope.$on 'ntn:login', (event, data) ->
      trackingObject = {}
      trackingObject.user_id = data.user_id
      trackingObject.name = data.name
      if data.email? then trackingObject.email = data.email

      UDC.trackEvent("syncAuthenticated", trackingObject)
]