'use strict';

/* Controllers */

angular.module('probytes.controllers', [])
  .controller('MainCtrl', function($scope, $http) {
    $http.get('data.json').success(function(data) {
      $scope.traffic = data;
      console.log('loaded ' + $scope.traffic.length + ' records');
    });
  });
