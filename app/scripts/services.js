'use strict';

/* Services */

angular.module('probytes.services', [])
  .service('trafficData', function($http, $q) {
    this.get = function() {
      var deferred = $q.defer();
      $http.get('data.json')
        .success(function(data) {
          deferred.resolve(data);
        })
        .error(function() {
          deferred.reject();
        });
      return deferred.promise;
    };
  });
