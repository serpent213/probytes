'use strict';

/* Controllers */

angular.module('probytes.controllers', [])
  .controller('MainCtrl', function($scope, trafficData) {
    $scope.traffic = trafficData.get();
    $scope.traffic.then(function(data) {
      console.log(data.raw.length + ' records in controller');
      console.log(data.byMonth[2013][5].length + ' records in 05/2013');
      $scope.trafficByMonth = data.byMonth[2013][5];
    });
  });
