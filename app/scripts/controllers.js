'use strict';

/* Controllers */

angular.module('probytes.controllers', [])
  .controller('MainCtrl', function($scope, trafficData) {
    $scope.traffic = trafficData.get();
    $scope.traffic.then(function(data) {
      console.log(data.length + ' records in controller');
    });
  });
